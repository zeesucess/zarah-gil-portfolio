const inquiryTypes = new Set(['Job Opportunity', 'Freelance Project', 'Collaboration', 'Other']);
const limit = 24576;

async function submitContact(request, env) {
  const reply = (status, message) => Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return reply(403, 'Open the contact form on the portfolio to send a message.');
  if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) {
    return reply(415, 'Open the contact form on the portfolio to send a message.');
  }
  if (Number(request.headers.get('Content-Length')) > limit) return reply(413, 'Please shorten your message.');
  const body = await request.text();
  if (body.length > limit) return reply(413, 'Please shorten your message.');
  const form = new URLSearchParams(body);
  const field = (name) => form.get(name)?.trim() || '';
  const name = field('name');
  const email = field('email');
  const inquiry = field('inquiry');
  const message = field('message');
  const id = field('id') || crypto.randomUUID();

  if (field('website') || !/^[0-9a-f-]{36}$/i.test(id)) return reply(400, 'This submission could not be accepted.');
  if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !inquiryTypes.has(inquiry) || !message || message.length > 3000) {
    return reply(400, 'Check your name, email, inquiry type, and message, then try again.');
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO contact_messages (id, name, email, inquiry_type, message) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING'
    ).bind(id, name, email, inquiry, message).run();
    if (!result.success) throw new Error('Contact save failed');
    return reply(201, 'Thanks, your message was received.');
  } catch {
    return reply(503, 'Your message could not be saved. Please try again or use the email link.');
  }
}

function serveAsset(request, pathname) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const asset = Object.hasOwn(assets, pathname) && assets[pathname];
  if (!asset) return new Response('Not found', { status: 404 });
  const [contentType, encoded] = asset;
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  const headers = {
    'Content-Type': contentType,
    'Cache-Control': pathname === '/index.html' || pathname.endsWith('.js') ? 'no-cache' : 'public, max-age=300',
    'Content-Length': String(bytes.length),
    'Accept-Ranges': 'bytes',
  };
  const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get('Range') || '');
  if (range && request.method === 'GET') {
    const start = Number(range[1]);
    const end = Math.min(range[2] ? Number(range[2]) : bytes.length - 1, bytes.length - 1);
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.length}` } });
    return new Response(bytes.slice(start, end + 1), { status: 206, headers: {
      ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': String(end - start + 1),
    } });
  }
  return new Response(request.method === 'HEAD' ? null : bytes, { headers });
}

export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    return path === '/api/contact' ? submitContact(request, env) : serveAsset(request, path === '/' ? '/index.html' : path);
  },
};
