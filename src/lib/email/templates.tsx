import {
  Body,
  Container,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { formatInTimeZone } from "date-fns-tz";

type AppointmentEmailProps = {
  patientName: string;
  serviceName: string;
  doctorName: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  appointmentId: string;
  amountCents?: number;
};

const styles = {
  body: { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif", padding: "24px 0" },
  container: { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "560px", padding: "32px" },
  heading: { color: "#171717", fontSize: "24px", margin: "0 0 16px" },
  text: { color: "#52525b", fontSize: "16px", lineHeight: "24px" },
  detail: { backgroundColor: "#f4f4f5", borderRadius: "8px", color: "#171717", padding: "16px" },
  link: { color: "#0f9f92" },
};

function AppointmentDetails({ appointment }: { appointment: AppointmentEmailProps }) {
  return (
    <Section style={styles.detail}>
      <Text style={{ margin: "0 0 8px" }}><strong>Service:</strong> {appointment.serviceName}</Text>
      <Text style={{ margin: "0 0 8px" }}><strong>Doctor:</strong> {appointment.doctorName}</Text>
      <Text style={{ margin: "0 0 8px" }}>
        <strong>When:</strong>{" "}
        {formatInTimeZone(appointment.startsAt, appointment.timezone, "EEEE, MMMM d, yyyy 'at' h:mm a")}
      </Text>
      <Text style={{ margin: 0 }}><strong>Timezone:</strong> {appointment.timezone}</Text>
    </Section>
  );
}

function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={{ color: "#0f9f92", fontSize: "20px", fontWeight: "bold", margin: "0 0 24px" }}>
            CareSlot
          </Text>
          {children}
          <Text style={{ ...styles.text, fontSize: "13px", marginTop: "32px" }}>
            This message was sent by CareSlot. Please contact the clinic if you need help with your appointment.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function BookingConfirmationEmail({ appointment }: { appointment: AppointmentEmailProps }) {
  return (
    <EmailLayout preview="Your CareSlot appointment is confirmed">
      <Heading style={styles.heading}>Appointment confirmed</Heading>
      <Text style={styles.text}>Hi {appointment.patientName}, your appointment is confirmed.</Text>
      <AppointmentDetails appointment={appointment} />
      <Text style={styles.text}>Your calendar invite is attached to this email.</Text>
      <Link href={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/book/success`} style={styles.link}>
        Visit CareSlot
      </Link>
    </EmailLayout>
  );
}

export function PaymentReceiptEmail({ appointment }: { appointment: AppointmentEmailProps }) {
  return (
    <EmailLayout preview="Your CareSlot payment receipt">
      <Heading style={styles.heading}>Payment receipt</Heading>
      <Text style={styles.text}>Hi {appointment.patientName}, we received your appointment deposit.</Text>
      <AppointmentDetails appointment={appointment} />
      {appointment.amountCents !== undefined && (
        <Text style={styles.text}>
          Deposit paid: ${(appointment.amountCents / 100).toFixed(2)} USD
        </Text>
      )}
    </EmailLayout>
  );
}

export function CancellationEmail({ appointment }: { appointment: AppointmentEmailProps }) {
  return (
    <EmailLayout preview="Your CareSlot appointment was cancelled">
      <Heading style={styles.heading}>Appointment cancelled</Heading>
      <Text style={styles.text}>
        Hi {appointment.patientName}, your appointment below has been cancelled.
      </Text>
      <AppointmentDetails appointment={appointment} />
      <Text style={styles.text}>You can book a new appointment whenever you are ready.</Text>
      <Link href={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/book`} style={styles.link}>
        Book another appointment
      </Link>
    </EmailLayout>
  );
}

export function ReminderEmail({ appointment }: { appointment: AppointmentEmailProps }) {
  return (
    <EmailLayout preview="Reminder: your CareSlot appointment is tomorrow">
      <Heading style={styles.heading}>Appointment reminder</Heading>
      <Text style={styles.text}>
        Hi {appointment.patientName}, this is a reminder that your appointment is within the next 24 hours.
      </Text>
      <AppointmentDetails appointment={appointment} />
    </EmailLayout>
  );
}
