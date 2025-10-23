import nodemailer from "nodemailer";

export type QuickContactPayload = {
  source?: string;
  userAgent?: string;
  ip?: string;
  extras?: Record<string, unknown>;
};

export async function sendQuickContactEmail(payload: QuickContactPayload = {}) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    CONTACT_TO,
    CONTACT_FROM,
  } = process.env as Record<string, string | undefined>;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration missing (SMTP_HOST/PORT/USER/PASS)");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const to = CONTACT_TO || "info@mobilien.hu";
  const from = CONTACT_FROM || `Mobilien Landing <no-reply@mobilien.hu>`;

  const now = new Date().toISOString();
  const subject = `Gyors kapcsolatfelvétel – Landing gomb (${now})`;

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 8px 0">Gyors kapcsolatfelvétel</h2>
      <p style="margin:0 0 12px 0">A landing oldalon rákattintottak a Kapcsolatfelvétel gombra.</p>
      <ul style="padding:0;margin:0;list-style:none">
        <li><strong>Időpont:</strong> ${now}</li>
        <li><strong>Forrás:</strong> ${payload.source || "unknown"}</li>
        <li><strong>IP:</strong> ${payload.ip || "unknown"}</li>
        <li><strong>User-Agent:</strong> ${payload.userAgent || "unknown"}</li>
      </ul>
      <pre style="background:#f6f7f9;padding:12px;border-radius:8px;overflow:auto">${JSON.stringify(payload.extras || {}, null, 2)}</pre>
    </div>
  `;

  await transporter.sendMail({
    to,
    from,
    subject,
    html,
  });
}

export type ContactFormData = {
  company?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function sendContactFormEmail(data: ContactFormData) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    CONTACT_TO,
    CONTACT_FROM,
  } = process.env as Record<string, string | undefined>;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration missing (SMTP_HOST/PORT/USER/PASS)");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const to = CONTACT_TO || "info@mobilien.hu";
  const from = CONTACT_FROM || `Mobilien Kapcsolat <no-reply@mobilien.hu>`;

  const now = new Date().toISOString();
  const subject = `[Kapcsolat] ${data.subject} – ${data.name}`;

  const html = `
    <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
      <h2 style="margin:0 0 8px 0">Új üzenet a kapcsolatfelvételi űrlapról</h2>
      <p style="margin:0 0 12px 0">Időpont: ${now}</p>
      <table style="border-collapse:collapse;width:100%">
        <tbody>
          <tr><td style="padding:6px 0;width:160px"><strong>Cégnév</strong></td><td>${data.company || "-"}</td></tr>
          <tr><td style="padding:6px 0"><strong>Név</strong></td><td>${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:6px 0"><strong>E-mail</strong></td><td>${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Telefonszám</strong></td><td>${data.phone ? escapeHtml(data.phone) : "-"}</td></tr>
          <tr><td style="padding:6px 0"><strong>Tárgy</strong></td><td>${escapeHtml(data.subject)}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:12px;padding:12px;border:1px solid #E5E7EB;border-radius:8px;background:#F9FAFB">
        <div style="font-weight:600;margin-bottom:6px">Üzenet</div>
        <div style="white-space:pre-wrap">${escapeHtml(data.message)}</div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    to,
    from,
    subject,
    replyTo: data.email,
    html,
  });
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


