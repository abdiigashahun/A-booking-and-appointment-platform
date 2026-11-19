import {
  appointmentCalendarAttachment,
  sendEmail,
} from "./index";
import {
  BookingConfirmationEmail,
  CancellationEmail,
  PaymentReceiptEmail,
  ReminderEmail,
} from "./templates";

type AppointmentWithDetails = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  user: { name: string; email: string };
  doctor: { name: string };
  service: { name: string; depositCents: number };
};

function emailProps(appointment: AppointmentWithDetails) {
  return {
    patientName: appointment.user.name,
    serviceName: appointment.service.name,
    doctorName: appointment.doctor.name,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    timezone: process.env.CLINIC_TIMEZONE ?? "Africa/Addis_Ababa",
    appointmentId: appointment.id,
    amountCents: appointment.service.depositCents,
  };
}

export async function sendBookingConfirmation(appointment: AppointmentWithDetails) {
  const props = emailProps(appointment);
  const attachment = appointmentCalendarAttachment({
    id: appointment.id,
    serviceName: props.serviceName,
    doctorName: props.doctorName,
    startsAt: props.startsAt,
    endsAt: props.endsAt,
  });
  await sendEmail({
    to: appointment.user.email,
    subject: `Appointment confirmed - ${props.serviceName}`,
    react: BookingConfirmationEmail({ appointment: props }),
    attachments: [attachment],
  });
}

export async function sendPaymentReceipt(appointment: AppointmentWithDetails) {
  const props = emailProps(appointment);
  await sendEmail({
    to: appointment.user.email,
    subject: `Payment receipt - ${props.serviceName}`,
    react: PaymentReceiptEmail({ appointment: props }),
  });
}

export async function sendCancellationNotice(appointment: AppointmentWithDetails) {
  const props = emailProps(appointment);
  await sendEmail({
    to: appointment.user.email,
    subject: `Appointment cancelled - ${props.serviceName}`,
    react: CancellationEmail({ appointment: props }),
  });
}

export async function sendAppointmentReminder(appointment: AppointmentWithDetails) {
  const props = emailProps(appointment);
  await sendEmail({
    to: appointment.user.email,
    subject: `Reminder: ${props.serviceName} appointment`,
    react: ReminderEmail({ appointment: props }),
  });
}
