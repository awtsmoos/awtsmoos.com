// B"H
/**
 * @module PublicContactSignal
 * @description The Awtsmoos validates, delivers, and records public issue reports through the server's canonical dynamic-route and SMTP rivers.
 */
const crypto = require('crypto');
const RECIPIENT = 'cobykaufer@gmail.com';
const SENDER = 'contact@awtsmoos.com';
const recentSignals = new Map();

module.exports = {
	dynamicRoutes: async $i => {
		await $i.use({
			'/': async () => $i.request.method === 'POST' ? submit($i) : status(),
			'/status': async () => status()
		});
	}
};

function status() {
	return { BH: 'B"H', ok: true, service: 'Awtsmoos Contact Signal' };
}

async function submit($i) {
	const signal = normalize(parseBody($i.$_POST));
	const key = clientKey($i);
	const problem = validate(signal, key);
	if (problem) return response($i, 400, { ok: false, message: problem });

	const reference = createReference();
	const record = { ...signal, reference, createdAt: Date.now(), ipHint: key };
	await deliverSignal($i, record);
	await storeSignal($i, record);
	recentSignals.set(key, Date.now());
	return response($i, 200, { ok: true, reference });
}

function parseBody(post) {
	if (!post?.__raw_body__) return post || {};
	try {
		return JSON.parse(post.__raw_body__.toString('utf8'));
	} catch {
		return {};
	}
}

function normalize(body) {
	return {
		name: clean(body.name, 80), email: clean(body.email, 160),
		kind: clean(body.kind, 30), subject: clean(body.subject, 140),
		message: clean(body.message, 5000), company: clean(body.company, 120),
		startedAt: Number(body.startedAt || 0)
	};
}

function validate(signal, key) {
	if (signal.company) return 'Unable to accept this submission.';
	if (!signal.name || !signal.subject || signal.message.length < 12) return 'Please complete every required field.';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signal.email)) return 'Please enter a valid email address.';
	if (!['issue', 'idea', 'account', 'other'].includes(signal.kind)) return 'Please choose a valid message type.';
	if (!signal.startedAt || Date.now() - signal.startedAt < 1800) return 'Please take a moment to review your message.';
	if (Date.now() - (recentSignals.get(key) || 0) < 60000) return 'Please wait before sending another message.';
	return '';
}

async function deliverSignal($i, record) {
	const client = $i.mail?.smtpClient;
	if (!client?.sendMail) throw new Error('Outbound email service is unavailable.');
	const subject = `[Awtsmoos ${record.kind}] ${record.subject} — ${record.reference}`;
	const body = [`Reference: ${record.reference}`, `Type: ${record.kind}`, `From: ${record.name} <${record.email}>`, '', record.message].join('\n');
	await client.sendMail(SENDER, RECIPIENT, subject, body, { 'Reply-To': record.email });
}

async function storeSignal($i, record) {
	if ($i.db?.write) await $i.db.write(`/contactSignals/${record.reference}`, record);
}

function createReference() {
	return `AW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

function response($i, statusCode, body) {
	if ($i.response) $i.response.statusCode = statusCode;
	return body;
}

function clientKey($i) {
	const address = $i.request?.headers?.['x-forwarded-for'] || $i.request?.socket?.remoteAddress || 'unknown';
	return String(address).split(',')[0].trim().slice(0, 120);
}

function clean(value, limit) {
	return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}
