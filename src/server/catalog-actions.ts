"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/admin-auth";

const idSchema = z.string().min(1).max(200);
const specialtySchema = z.object({ id: idSchema.optional(), name: z.string().trim().min(2).max(80) });
const serviceSchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  durationMin: z.coerce.number().int().min(5).max(480),
  priceCents: z.coerce.number().int().min(0).max(10000000),
  depositCents: z.coerce.number().int().min(0).max(10000000),
});
const doctorSchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  specialtyId: idSchema,
});
const availabilitySchema = z.object({
  doctorId: idSchema,
  weekday: z.coerce.number().int().min(0).max(6),
  startMinute: z.coerce.number().int().min(0).max(1439),
  endMinute: z.coerce.number().int().min(1).max(1440),
}).refine((value) => value.endMinute > value.startMinute, { message: "End time must be after start time." });
const timeOffSchema = z.object({
  doctorId: idSchema,
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  reason: z.string().trim().max(300).optional(),
}).refine((value) => value.endsAt > value.startsAt, { message: "End time must be after start time." });
const relationSchema = z.object({ doctorId: idSchema, serviceId: idSchema });

export async function saveSpecialty(input: unknown) {
  await requireAdmin();
  const data = specialtySchema.parse(input);
  if (data.id) return db.specialty.update({ where: { id: data.id }, data: { name: data.name } });
  return db.specialty.create({ data: { name: data.name } });
}

export async function deactivateSpecialty(id: unknown) {
  await requireAdmin();
  const specialtyId = idSchema.parse(id);
  const doctorCount = await db.doctor.count({ where: { specialtyId: specialtyId, isActive: true } });
  if (doctorCount > 0) throw new Error("Move active doctors to another specialty before deactivating this specialty.");
  return db.specialty.update({ where: { id: specialtyId }, data: { isActive: false } });
}

export async function saveService(input: unknown) {
  await requireAdmin();
  const data = serviceSchema.parse(input);
  const payload = { name: data.name, description: data.description || null, durationMin: data.durationMin, priceCents: data.priceCents, depositCents: data.depositCents };
  if (data.id) return db.service.update({ where: { id: data.id }, data: payload });
  return db.service.create({ data: payload });
}

export async function deactivateService(id: unknown) {
  await requireAdmin();
  return db.service.update({ where: { id: idSchema.parse(id) }, data: { isActive: false } });
}

export async function saveDoctor(input: unknown) {
  await requireAdmin();
  const data = doctorSchema.parse(input);
  const payload = { name: data.name, bio: data.bio || null, imageUrl: data.imageUrl || null, specialtyId: data.specialtyId };
  if (data.id) return db.doctor.update({ where: { id: data.id }, data: payload });
  return db.doctor.create({ data: payload });
}

export async function deactivateDoctor(id: unknown) {
  await requireAdmin();
  return db.doctor.update({ where: { id: idSchema.parse(id) }, data: { isActive: false } });
}

export async function assignService(input: unknown) {
  await requireAdmin();
  const data = relationSchema.parse(input);
  return db.doctorService.upsert({ where: { doctorId_serviceId: data }, update: {}, create: data });
}

export async function removeService(input: unknown) {
  await requireAdmin();
  const data = relationSchema.parse(input);
  return db.doctorService.delete({ where: { doctorId_serviceId: data } });
}

export async function addAvailability(input: unknown) {
  await requireAdmin();
  const data = availabilitySchema.parse(input);
  return db.availability.create({ data });
}

export async function removeAvailability(id: unknown) {
  await requireAdmin();
  return db.availability.delete({ where: { id: idSchema.parse(id) } });
}

export async function addTimeOff(input: unknown) {
  await requireAdmin();
  const data = timeOffSchema.parse(input);
  return db.timeOff.create({ data: { ...data, reason: data.reason || null } });
}

export async function removeTimeOff(id: unknown) {
  await requireAdmin();
  return db.timeOff.delete({ where: { id: idSchema.parse(id) } });
}
