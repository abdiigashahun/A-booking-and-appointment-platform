import { render } from "@react-email/render";
import { Resend } from "resend";
import { createIcsEvent } from "./calendar";

type EmailAttachment = {
  filename: string;
  content: string;
  contentType: string;
};

type SendEmailInput = {
  to: string;
  subject: string;
  react: React.ReactElement;
  attachments?: EmailAttachment[];
};

let client: Resend | undefined;

function getResend() {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return undefined;
  client = new Resend(apiKey);
  return client;
}

export async function sendEmail({ to, subject, react, attachments }: SendEmailInput) {
  try {
    const html = await render(react);
    const from = process.env.EMAIL_FROM ?? "CareSlot <onboarding@resend.dev>";
    const resend = getResend();
    if (!resend) {
      console.info("Email delivery skipped: RESEND_API_KEY is missing.", { to, subject, html });
      return;
    }
    const { error } = await resend.emails.send({ from, to, subject, html, attachments });
    if (error) console.error("Email delivery failed.", { to, subject, error });
  } catch (error) {
    console.error("Email delivery failed.", { to, subject, error });
  }
}

export function appointmentCalendarAttachment(appointment: {
  id: string;
  serviceName: string;
  doctorName: string;
  startsAt: Date;
  endsAt: Date;
}) {
  return {
    filename: "careslot-appointment.ics",
    content: createIcsEvent({
      id: appointment.id,
      title: `${appointment.serviceName} with ${appointment.doctorName}`,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      description: `CareSlot appointment for ${appointment.serviceName} with ${appointment.doctorName}.`,
    }),
    contentType: "text/calendar",
  };
}
