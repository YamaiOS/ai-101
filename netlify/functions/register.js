// ─── Airtable ─────────────────────────────────────────────────────────────────

const INDUSTRY = { financial: 'Financial Services / Banking', legal: 'Legal / Compliance', healthcare: 'Healthcare / Life Sciences', government: 'Government / Public Sector', consulting: 'Management Consulting', insurance: 'Insurance', audit: 'Audit / Accounting', technology: 'Technology / Software', education: 'Education / Academia', other: 'Other' };
const DEVICE   = { personal: 'Personal laptop', corporate: 'Corporate / managed device' };
const SETUP    = { local: 'Local installation', codespaces: 'GitHub Codespaces' };
const EXP      = { none: 'No prior experience', basic: 'Claude chat only', some: 'Some Claude Code experience', regular: 'Regular user', advanced: 'Advanced / production workflows' };

async function saveToAirtable(data) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE = 'Registrations' } = process.env;
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) throw new Error('Airtable env vars not set');

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          'Student Name':           `${data.firstName} ${data.lastName}`,
          'Email':                  data.email,
          'Phone':                  data.phone,
          'Course Name':            'Claude Code Production Workflows',
          'Registration Date':      new Date().toISOString().split('T')[0],
          'Payment Status':         'Pending',
          'Special Requirements':   data.dietary || '',
          'Job Title':              data.jobTitle,
          'Organisation':           data.org,
          'Industry':               INDUSTRY[data.industry] || data.industry,
          'Referral Source':        data.referral || '',
          'Device Type':            DEVICE[data.device]    || data.device    || '',
          'Setup Path':             SETUP[data.setupPath]  || data.setupPath  || '',
          'GitHub Username':        data.github,
          'Environment Status':     data.envStatus || '',
          'Workflow Description':   data.workflow,
          'Domain Context':         data.domain,
          'AI Experience':          EXP[data.aiExp] || data.aiExp || '',
          'Learning Goal':          data.goal || '',
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Email via Resend ─────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html }) {
  const { RESEND_API_KEY, FROM_EMAIL = 'onboarding@resend.dev' } = process.env;
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Claude Code Workshop <${FROM_EMAIL}>`, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Email templates ──────────────────────────────────────────────────────────

function confirmationHtml(d) {
  const setupLabel = d.setupPath === 'codespaces' ? 'GitHub Codespaces' : 'Local installation';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f0ff;color:#222}
  .w{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px}
  .h{background:#1a0040;padding:2rem;text-align:center}
  .h h1{color:#c9a432;font-size:1rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.3rem}
  .h p{color:#9580b8;font-size:.82rem}
  .b{padding:2rem}
  .gr{font-size:1.05rem;font-weight:700;color:#1a0040;margin-bottom:1rem}
  p{color:#444;font-size:.9rem;line-height:1.7;margin-bottom:1rem}
  .price{background:#1a0040;border-radius:8px;padding:1.5rem;text-align:center;margin:1.5rem 0}
  .price .am{color:#c9a432;font-size:2rem;font-weight:800}
  .price .su{color:#9580b8;font-size:.8rem;margin-top:.25rem}
  .box{background:#f9f6ff;border-left:3px solid #c9a432;padding:1.25rem 1.5rem;border-radius:0 8px 8px 0;margin:1.5rem 0}
  .box h3{color:#1a0040;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.875rem}
  .box ol{padding-left:1.2rem}
  .box li{color:#444;font-size:.87rem;line-height:1.65;margin-bottom:.4rem}
  .det{background:#f5f2ff;border-radius:8px;padding:1.25rem 1.5rem;margin:1.5rem 0}
  .det h3{color:#1a0040;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.875rem}
  .dr{display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid #e8e0f0;font-size:.85rem}
  .dr:last-child{border-bottom:none}
  .dk{color:#888}.dv{color:#222;font-weight:500}
  .ft{background:#f4f0ff;padding:1.25rem 2rem;text-align:center;font-size:.75rem;color:#999;border-top:1px solid #e8e0f0}
  </style></head><body>
  <div class="w">
    <div class="h"><h1>Claude Code Production Workflows</h1><p>Full Day Workshop · April 2026 · Cyberjaya</p></div>
    <div class="b">
      <p class="gr">Hi ${d.firstName},</p>
      <p>Your registration has been received. Thank you for signing up.</p>
      <p><strong>Your seat is not yet confirmed.</strong> You'll receive payment instructions within 24 hours. Once payment is received, we'll confirm your seat and send the exact date, venue address, and setup clinic link.</p>
      <div class="price"><div class="am">RM 599</div><div class="su">per participant · inclusive of one month Claude Pro subscription</div></div>
      <div class="box">
        <h3>What happens next</h3>
        <ol>
          <li>Payment instructions arrive in a separate email within 24 hours</li>
          <li>Make payment to confirm your seat</li>
          <li>You'll receive the exact date, venue, and setup clinic link</li>
          <li>Set up your environment — you selected <strong>${setupLabel}</strong></li>
          <li>Finalise your workflow description if needed (reply to this email to update it)</li>
          <li>Attend the setup clinic the evening before if your environment needs verification</li>
          <li>Arrive by 8:30 on the day — environment confirmed, workflow written</li>
        </ol>
      </div>
      <div class="det">
        <h3>Your registration summary</h3>
        <div class="dr"><span class="dk">Name</span><span class="dv">${d.firstName} ${d.lastName}</span></div>
        <div class="dr"><span class="dk">Organisation</span><span class="dv">${d.org}</span></div>
        <div class="dr"><span class="dk">Setup path</span><span class="dv">${setupLabel}</span></div>
        <div class="dr"><span class="dk">GitHub</span><span class="dv">@${d.github}</span></div>
        <div class="dr"><span class="dk">Domain</span><span class="dv">${d.domain}</span></div>
      </div>
      <p>Questions before the day? Reply to this email.</p>
    </div>
    <div class="ft"><p>Claude Code Production Workflows · April 2026 · Cyberjaya</p><p style="margin-top:.3rem">You received this because you registered at claude-code-ai101.netlify.app</p></div>
  </div>
  </body></html>`;
}

function notificationHtml(d) {
  const date = new Date().toLocaleString('en-MY', { dateStyle: 'full', timeStyle: 'short' });
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f0ff}
  .w{max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden}
  .h{background:#1a0040;padding:1.5rem 2rem}
  .h h1{color:#c9a432;font-size:1rem;font-weight:800;margin-bottom:.2rem}
  .h p{color:#9580b8;font-size:.8rem}
  .b{padding:1.75rem 2rem}
  .alert{background:#edfbf5;border:1px solid #b6f0d8;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:.9rem;color:#1a6640}
  .sec{margin-bottom:1.5rem}
  .sec h3{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#c9a432;font-weight:700;margin-bottom:.75rem}
  table{width:100%;border-collapse:collapse}
  td{padding:.4rem 0;font-size:.86rem;border-bottom:1px solid #f0f0f0;vertical-align:top}
  td:first-child{color:#888;width:38%;padding-right:1rem}
  td:last-child{color:#222;font-weight:500}
  tr:last-child td{border-bottom:none}
  .wf{background:#f9f6ff;border-left:3px solid #c9a432;padding:1rem 1.25rem;border-radius:0 6px 6px 0;font-size:.86rem;color:#444;line-height:1.75;white-space:pre-wrap;word-break:break-word}
  .ft{background:#f5f2ff;padding:1rem 2rem;text-align:center;font-size:.75rem;color:#999;border-top:1px solid #e8e0f0}
  </style></head><body>
  <div class="w">
    <div class="h"><h1>New Registration</h1><p>Claude Code Production Workflows · ${date}</p></div>
    <div class="b">
      <div class="alert">New registration from <strong>${d.firstName} ${d.lastName}</strong> at <strong>${d.org}</strong>. Send payment instructions to ${d.email}.</div>
      <div class="sec"><h3>Contact Details</h3>
        <table>
          <tr><td>Name</td><td>${d.firstName} ${d.lastName}</td></tr>
          <tr><td>Email</td><td>${d.email}</td></tr>
          <tr><td>Phone</td><td>${d.phone}</td></tr>
          <tr><td>Job Title</td><td>${d.jobTitle}</td></tr>
          <tr><td>Organisation</td><td>${d.org}</td></tr>
          <tr><td>Industry</td><td>${INDUSTRY[d.industry] || d.industry}</td></tr>
          <tr><td>Referral</td><td>${d.referral || '—'}</td></tr>
        </table>
      </div>
      <div class="sec"><h3>Environment</h3>
        <table>
          <tr><td>Device</td><td>${DEVICE[d.device] || d.device || '—'}</td></tr>
          <tr><td>Setup path</td><td>${SETUP[d.setupPath] || d.setupPath || '—'}</td></tr>
          <tr><td>GitHub</td><td>@${d.github}</td></tr>
          <tr><td>Env status</td><td>${d.envStatus || '—'}</td></tr>
          <tr><td>Dietary / Access</td><td>${d.dietary || '—'}</td></tr>
        </table>
      </div>
      <div class="sec"><h3>Pre-Workshop</h3>
        <table>
          <tr><td>Domain context</td><td>${d.domain}</td></tr>
          <tr><td>AI experience</td><td>${EXP[d.aiExp] || d.aiExp || '—'}</td></tr>
          <tr><td>Learning goal</td><td>${d.goal || '—'}</td></tr>
        </table>
      </div>
      <div class="sec"><h3>Workflow Description</h3><div class="wf">${d.workflow}</div></div>
    </div>
    <div class="ft">Submitted via claude-code-ai101.netlify.app</div>
  </div>
  </body></html>`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let data;
  try { data = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  // Basic validation
  const required = ['firstName','lastName','email','phone','jobTitle','org','industry','github','workflow','domain'];
  const missing  = required.filter(f => !data[f]?.trim());
  if (missing.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields', fields: missing }) };

  // 1. Save to Airtable — if this fails, surface the error (we'd lose the registration)
  try {
    await saveToAirtable(data);
    console.log('Airtable: saved', data.email);
  } catch (err) {
    console.error('Airtable error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save registration. Please try again.' }) };
  }

  // 2. Confirmation email to registrant
  try {
    await sendEmail({ to: data.email, subject: 'Registration received — Claude Code Production Workflows', html: confirmationHtml(data) });
    console.log('Confirmation sent to', data.email);
  } catch (err) {
    console.error('Confirmation email error:', err.message); // don't block — data is saved
  }

  // 3. Notification email to organizer
  const organizer = process.env.ORGANIZER_EMAIL;
  if (organizer) {
    try {
      await sendEmail({ to: organizer, subject: `New registration: ${data.firstName} ${data.lastName} (${data.org})`, html: notificationHtml(data) });
      console.log('Notification sent to organizer');
    } catch (err) {
      console.error('Notification email error:', err.message);
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
};
