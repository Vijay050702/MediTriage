import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { type } = await req.json();

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", todayStr)
      .neq("status", "cancelled");

    if (error) throw error;

    const notifications = [];

    for (const apt of appointments) {
      const [hours, minutes] = apt.appointment_time.split(":").map(Number);
      const appointmentMinutes = hours * 60 + minutes;
      const minutesUntil = appointmentMinutes - currentMinutes;

      const { data: patient } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", apt.patient_id)
        .single();

      const { data: doctor } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", apt.doctor_id)
        .single();

      if (type === "day-of" || !type) {
        if (patient?.email) {
          await sendEmail({
            to: patient.email,
            subject: `Appointment Today at ${apt.appointment_time}`,
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0D9488; color: white; padding: 24px; text-align: center;">
                  <h1>MediTriage Reminder</h1>
                </div>
                <div style="padding: 24px; background: #F8FAFC;">
                  <h2>Hello ${apt.patient_name},</h2>
                  <p>You have an appointment <strong>today</strong> with <strong>Dr. ${apt.doctor_name}</strong>.</p>
                  <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Time:</strong> ${apt.appointment_time}</p>
                    <p><strong>Specialization:</strong> ${apt.doctor_specialization || "General"}</p>
                    <p><strong>Type:</strong> ${apt.consultation_type === "online" ? "Video Call" : "In-Clinic Visit"}</p>
                    ${apt.hospital ? `<p><strong>Location:</strong> ${apt.hospital}</p>` : ""}
                  </div>
                  ${apt.consultation_type === "online"
                    ? `<p style="color: #0D9488; font-weight: 600;">Join the video call link 15 minutes before your appointment.</p>`
                    : `<p style="color: #0D9488; font-weight: 600;">Please arrive 10 minutes before your scheduled time.</p>`
                  }
                </div>
              </div>
            `,
          });
          notifications.push({ appointment: apt.id, recipient: "patient", type: "day-of" });
        }

        if (doctor?.email) {
          await sendEmail({
            to: doctor.email,
            subject: `Appointment Today with ${apt.patient_name}`,
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1E293B; color: white; padding: 24px; text-align: center;">
                  <h1>MediTriage Reminder</h1>
                </div>
                <div style="padding: 24px; background: #F8FAFC;">
                  <h2>Hello Dr. ${apt.doctor_name},</h2>
                  <p>You have an appointment <strong>today</strong> with patient <strong>${apt.patient_name}</strong>.</p>
                  <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Time:</strong> ${apt.appointment_time}</p>
                    <p><strong>Type:</strong> ${apt.consultation_type === "online" ? "Video Call" : "In-Clinic Visit"}</p>
                    ${apt.symptoms ? `<p><strong>Symptoms:</strong> ${apt.symptoms}</p>` : ""}
                  </div>
                </div>
              </div>
            `,
          });
          notifications.push({ appointment: apt.id, recipient: "doctor", type: "day-of" });
        }
      }

      if ((type === "15min" || !type) && minutesUntil > 0 && minutesUntil <= 15) {
        if (patient?.email) {
          await sendEmail({
            to: patient.email,
            subject: `Appointment in ${minutesUntil} minutes!`,
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #F59E0B; color: white; padding: 24px; text-align: center;">
                  <h1>Appointment Starting Soon</h1>
                </div>
                <div style="padding: 24px; background: #FFFBEB;">
                  <h2>Reminder for ${apt.patient_name},</h2>
                  <p>Your appointment with <strong>Dr. ${apt.doctor_name}</strong> starts in <strong>${minutesUntil} minutes</strong>!</p>
                  <p><strong>Time:</strong> ${apt.appointment_time}</p>
                  <p><strong>Type:</strong> ${apt.consultation_type === "online" ? "Video Call" : "In-Clinic Visit"}</p>
                </div>
              </div>
            `,
          });
          notifications.push({ appointment: apt.id, recipient: "patient", type: "15min" });
        }

        if (doctor?.email) {
          await sendEmail({
            to: doctor.email,
            subject: `Appointment with ${apt.patient_name} in ${minutesUntil} min`,
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #F59E0B; color: white; padding: 24px; text-align: center;">
                  <h1>Appointment Starting Soon</h1>
                </div>
                <div style="padding: 24px; background: #FFFBEB;">
                  <h2>Reminder for Dr. ${apt.doctor_name},</h2>
                  <p>Your appointment with <strong>${apt.patient_name}</strong> starts in <strong>${minutesUntil} minutes</strong>!</p>
                </div>
              </div>
            `,
          });
          notifications.push({ appointment: apt.id, recipient: "doctor", type: "15min" });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "MediTriage <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to send email:", error);
  }

  return response.json();
}
