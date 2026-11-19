import Stripe from "stripe";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendBookingConfirmation,
  sendCancellationNotice,
  sendPaymentReceipt,
} from "@/lib/email/appointment-emails";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      if (appointmentId) {
        const updated = await db.appointment.updateMany({
          where: { id: appointmentId, status: AppointmentStatus.PENDING_PAYMENT },
          data: {
            status: AppointmentStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          },
        });
        if (updated.count) {
          const appointment = await db.appointment.findUnique({
            where: { id: appointmentId },
            include: { user: true, doctor: true, service: true },
          });
          if (appointment) {
            await sendBookingConfirmation(appointment);
            await sendPaymentReceipt(appointment);
          }
        }
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      if (appointmentId) {
        const updated = await db.appointment.updateMany({
          where: { id: appointmentId, status: AppointmentStatus.PENDING_PAYMENT },
          data: { status: AppointmentStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
        });
        if (updated.count) {
          const appointment = await db.appointment.findUnique({
            where: { id: appointmentId },
            include: { user: true, doctor: true, service: true },
          });
          if (appointment) await sendCancellationNotice(appointment);
        }
      }
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object;
      if (typeof charge.payment_intent === "string") {
        await db.appointment.updateMany({
          where: { stripePaymentIntentId: charge.payment_intent, paymentStatus: PaymentStatus.PAID },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });
      }
    }
  } catch (error) {
    console.error("Failed to process Stripe webhook", { eventId: event.id, error });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
