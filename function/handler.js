const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

export async function handle(event) {
  try {
    const method = (event.httpMethod || event.method || '').toUpperCase();

    if (method === 'OPTIONS') {
      return { statusCode: 200, headers: { ...CORS_HEADERS, 'Content-Length': '0' }, body: '' };
    }

    if (method !== 'POST') {
      return response(405, { error: 'Méthode non autorisée.' });
    }

    let data;
    try {
      const raw = typeof event.body === 'string' ? event.body : JSON.stringify(event.body || {});
      data = JSON.parse(raw);
    } catch {
      return response(400, { error: 'Corps de requête invalide.' });
    }

    const { honeypot, salutation, name, email, message } = data;

    if (honeypot) {
      return response(200, { success: true });
    }

    if (!name || !name.trim()) {
      return response(400, { error: 'Le nom est requis.' });
    }
    if (!email || !isValidEmail(email.trim())) {
      return response(400, { error: 'Adresse e-mail invalide.' });
    }
    if (!message || message.trim().length < 10) {
      return response(400, { error: 'Le message doit contenir au moins 10 caractères.' });
    }

    const senderName = `${salutation || ''} ${name}`.trim();

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key':      process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender:      { name: process.env.RECIPIENT_NAME, email: process.env.RECIPIENT_EMAIL },
        to:          [{ email: process.env.RECIPIENT_EMAIL, name: process.env.RECIPIENT_NAME }],
        replyTo:     { email: email.trim(), name: senderName },
        subject:     `[Portfolio] Message de ${senderName}`,
        textContent: [
          `Civilité   : ${salutation || '—'}`,
          `Nom/Prénom : ${name}`,
          `Email      : ${email}`,
          '',
          'Message :',
          message,
        ].join('\n'),
        htmlContent: `
          <p><strong>Civilité :</strong> ${esc(salutation || '—')}</p>
          <p><strong>Nom / Prénom :</strong> ${esc(name)}</p>
          <p><strong>Email :</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
          <hr style="border:none;border-top:1px solid #ccc;margin:1rem 0;" />
          <p style="white-space:pre-wrap">${esc(message)}</p>
        `.trim(),
      }),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.json().catch(() => ({}));
      console.error('Brevo error:', err);
      return response(502, { error: "Erreur lors de l'envoi de l'e-mail." });
    }

    return response(200, { success: true });

  } catch (err) {
    console.error('[handler crash]', err);
    return response(500, { error: 'Erreur interne du serveur.' });
  }
}
