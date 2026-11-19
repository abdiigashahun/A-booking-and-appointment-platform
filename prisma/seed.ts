import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const adminPassword = "CareSlotAdmin!2026#Secure";

async function main() {
  const specialties = await Promise.all(
    ["General Medicine", "Dentistry", "Pediatrics"].map((name) =>
      prisma.specialty.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const specialtyByName = new Map(specialties.map((specialty) => [specialty.name, specialty]));
  const services = [
    ["General Checkup", "A preventive visit for your overall health.", 30, 3000, 1000],
    ["Dental Cleaning", "Professional cleaning and oral health guidance.", 45, 4500, 1500],
    ["Pediatric Consultation", "A thoughtful visit for children and families.", 30, 3500, 1200],
    ["Specialist Consultation", "Focused support for a specific health concern.", 45, 5000, 1500],
    ["Follow-up Visit", "A follow-up to review progress and next steps.", 20, 2500, 800],
  ] as const;
  const serviceRecords = await Promise.all(
    services.map(([name, description, durationMin, priceCents, depositCents]) =>
      prisma.service.upsert({
        where: { name },
        update: { description, durationMin, priceCents, depositCents, isActive: true },
        create: { name, description, durationMin, priceCents, depositCents },
      }),
    ),
  );
  const serviceByName = new Map(serviceRecords.map((service) => [service.name, service]));

  const doctors = [
    ["Dr. Amina Kebede", "General Medicine", "Compassionate primary care for every stage of life.", ["General Checkup", "Follow-up Visit"]],
    ["Dr. Michael Nuru", "General Medicine", "Evidence-led care with time to listen.", ["General Checkup", "Specialist Consultation", "Follow-up Visit"]],
    ["Dr. Sara Hassan", "Pediatrics", "Warm, family-centered care for growing patients.", ["Pediatric Consultation", "Follow-up Visit"]],
    ["Dr. Daniel Tesfaye", "Dentistry", "Gentle, practical care for a healthier smile.", ["Dental Cleaning", "Specialist Consultation"]],
  ] as const;
  const weekdays = [1, 2, 3, 4, 5];
  for (const [name, specialtyName, bio, serviceNames] of doctors) {
    const specialty = specialtyByName.get(specialtyName);
    if (!specialty) throw new Error(`Missing specialty: ${specialtyName}`);
    const doctor = await prisma.doctor.upsert({
      where: { id: `${name.toLowerCase().replaceAll(" ", "-")}` },
      update: { name, bio, specialtyId: specialty.id, isActive: true },
      create: { id: `${name.toLowerCase().replaceAll(" ", "-")}`, name, bio, specialtyId: specialty.id },
    });
    await prisma.doctorService.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.doctorService.createMany({
      data: serviceNames.map((serviceName) => {
        const service = serviceByName.get(serviceName);
        if (!service) throw new Error(`Missing service: ${serviceName}`);
        return { doctorId: doctor.id, serviceId: service.id };
      }),
    });
    await prisma.availability.deleteMany({ where: { doctorId: doctor.id } });
    await prisma.availability.createMany({
      data: weekdays.map((weekday) => ({ doctorId: doctor.id, weekday, startMinute: 8 * 60, endMinute: 17 * 60 })),
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@careslot.test" },
    update: { name: "CareSlot Admin", role: Role.ADMIN, passwordHash: await bcrypt.hash(adminPassword, 12) },
    create: { name: "CareSlot Admin", email: "admin@careslot.test", role: Role.ADMIN, passwordHash: await bcrypt.hash(adminPassword, 12) },
  });

  console.log("Seed complete.");
  console.log("Admin email: admin@careslot.test");
  console.log(`Admin password (store securely): ${adminPassword}`);
}

main()
  .catch(async (error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
