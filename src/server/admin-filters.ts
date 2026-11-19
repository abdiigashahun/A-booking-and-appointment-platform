import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

export const appointmentFilterSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  doctorId: z.string().max(200).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

export type AppointmentFilters = z.infer<typeof appointmentFilterSchema>;
