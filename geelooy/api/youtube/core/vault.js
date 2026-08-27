// B"H
const crypto = require('crypto');

function encrypt(value, secret) {
	const key = crypto.createHash('sha256').update(String(secret)).digest();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
	return {
		version: 1,
		iv: iv.toString('base64url'),
		tag: cipher.getAuthTag().toString('base64url'),
		data: data.toString('base64url')
	};
}

function decrypt(envelope, secret) {
	const key = crypto.createHash('sha256').update(String(secret)).digest();
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64url'));
	decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
	const data = Buffer.concat([
		decipher.update(Buffer.from(envelope.data, 'base64url')),
		decipher.final()
	]);
	return JSON.parse(data.toString('utf8'));
}

module.exports = { decrypt, encrypt };
