import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUniqueDoctor: vi.fn(),
  findUniqueService: vi.fn(),
  findManyAppointments: vi.fn(),
  findManyTimeOff: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    doctor: { findUnique: mocks.findUniqueDoctor },
    service: { findUnique: mocks.findUniqueService },
    appointment: { findMany: mocks.findManyAppointments },
    timeOff: { findMany: mocks.findManyTimeOff },
  },
}));

import { getAvailableSlots } from "@/lib/slots";

const baseNow = new Date("2026-06-15T00:00:00.000Z");
const availability = [{ weekday: 1, startMinute: 8 * 60, endMinute: 10 * 60 }];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findUniqueDoctor.mockResolvedValue({ isActive: true, availability });
  mocks.findUniqueService.mockResolvedValue({ isActive: true, durationMin: 30 });
  mocks.findManyAppointments.mockResolvedValue([]);
  mocks.findManyTimeOff.mockResolvedValue([]);
});

function slot(date: string, hour: number, minute = 0) {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+03:00`).toISOString();
}

describe("getAvailableSlots", () => {
  it("generates a normal day in 15-minute increments", async () => {
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result).toHaveLength(7);
    expect(result[0]).toBe(slot("2026-06-15", 8));
    expect(result[1]).toBe(slot("2026-06-15", 8, 15));
  });

  it("returns no slots when the doctor is inactive", async () => {
    mocks.findUniqueDoctor.mockResolvedValue({ isActive: false, availability });
    expect(await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow })).toEqual([]);
  });

  it("returns no slots when the service is inactive", async () => {
    mocks.findUniqueService.mockResolvedValue({ isActive: false, durationMin: 30 });
    expect(await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow })).toEqual([]);
  });

  it("returns no slots when the service does not fit the window", async () => {
    mocks.findUniqueService.mockResolvedValue({ isActive: true, durationMin: 121 });
    expect(await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow })).toEqual([]);
  });

  it("removes a fully booked day", async () => {
    mocks.findManyAppointments.mockResolvedValue([{ status: "CONFIRMED", createdAt: baseNow, startsAt: new Date("2026-06-15T04:30:00Z"), endsAt: new Date("2026-06-15T08:00:00Z") }]);
    expect(await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow })).toEqual([]);
  });

  it("removes appointments that overlap the beginning of a slot", async () => {
    mocks.findManyAppointments.mockResolvedValue([{ status: "CONFIRMED", createdAt: baseNow, startsAt: new Date(slot("2026-06-15", 8, 15)), endsAt: new Date(slot("2026-06-15", 8, 45)) }]);
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result).not.toContain(slot("2026-06-15", 8));
    expect(result).not.toContain(slot("2026-06-15", 8, 15));
    expect(result).toContain(slot("2026-06-15", 8, 45));
  });

  it("keeps slots that end exactly when an appointment begins", async () => {
    mocks.findManyAppointments.mockResolvedValue([{ status: "CONFIRMED", createdAt: baseNow, startsAt: new Date(slot("2026-06-15", 8, 30)), endsAt: new Date(slot("2026-06-15", 9)) }]);
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result).toContain(slot("2026-06-15", 8));
  });

  it("removes slots overlapping time off", async () => {
    mocks.findManyTimeOff.mockResolvedValue([{ startsAt: new Date(slot("2026-06-15", 8, 30)), endsAt: new Date(slot("2026-06-15", 9, 15)) }]);
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result).not.toContain(slot("2026-06-15", 8, 15));
    expect(result).toContain(slot("2026-06-15", 9, 15));
  });

  it("removes slots inside the two-hour minimum notice", async () => {
    const now = new Date("2026-06-15T02:30:00.000Z");
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now });
    expect(result).not.toContain(slot("2026-06-15", 7, 30));
    expect(result).toContain(slot("2026-06-15", 8));
  });

  it("removes all slots for a day in the past", async () => {
    const now = new Date("2026-06-16T06:00:00.000Z");
    expect(await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now })).toEqual([]);
  });

  it("ignores expired pending payment holds", async () => {
    mocks.findManyAppointments.mockResolvedValue([{ status: "PENDING_PAYMENT", createdAt: new Date(baseNow.getTime() - 16 * 60 * 1000), startsAt: new Date(slot("2026-06-15", 8)), endsAt: new Date(slot("2026-06-15", 8, 30)) }]);
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result).toContain(slot("2026-06-15", 8));
  });

  it("blocks active pending payment holds", async () => {
    mocks.findManyAppointments.mockResolvedValue([{ status: "PENDING_PAYMENT", createdAt: new Date(baseNow.getTime() - 14 * 60 * 1000), startsAt: new Date(slot("2026-06-15", 8)), endsAt: new Date(slot("2026-06-15", 8, 30)) }]);
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result).not.toContain(slot("2026-06-15", 8));
  });

  it("uses the clinic weekday rather than the server weekday", async () => {
    await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(mocks.findUniqueDoctor).toHaveBeenCalledWith(expect.objectContaining({ include: { availability: { where: { weekday: 1 } } } }));
  });

  it("converts Africa/Addis Ababa local time to UTC", async () => {
    const result = await getAvailableSlots({ doctorId: "doctor", serviceId: "service", date: "2026-06-15", now: baseNow });
    expect(result[0]).toBe("2026-06-15T05:00:00.000Z");
  });
});
