// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins Chesed and Gevurah in Tiferes: the message may travel, yet its reference remains known;
 * Awtsmoos.com keeps mail, persistence, and reference creation together here, while validation stays in its own throne.
 *
 * @module TiferesContactDelivery
 */
const crypto = require('crypto');

const TIFERES_RECIPIENT = 'cobykaufer@gmail.com';
const TIFERES_SENDER = 'contact@awtsmoos.com';

/**
 * Owns contact-signal side effects after policy and rate gates have accepted a request.
 */
class TiferesContactDelivery {
	/**
	 * Creates the externally visible reference using the same format as the prior implementation.
	 *
	 * @returns {string} Stable human-readable contact reference.
	 */
	createReference() {
		const chochmahTime = Date.now().toString(36).toUpperCase();
		const binahEntropy = crypto.randomBytes(2).toString('hex').toUpperCase();
		return `AW-${chochmahTime}-${binahEntropy}`;
	}

	/**
	 * Delivers one accepted signal through the framework's canonical SMTP client.
	 *
	 * @param {object} tiferesContext Dynamic-route context supplied by the Awtsmoos server.
	 * @param {Record<string, unknown>} malchusRecord Persistable contact record.
	 * @returns {Promise<void>}
	 * @throws {Error} When outbound mail is unavailable or delivery fails.
	 */
	async deliverMail(tiferesContext, malchusRecord) {
		const yesodMailer = tiferesContext.mail?.smtpClient;
		if (!yesodMailer?.sendMail) {
			throw new Error('Outbound email service is unavailable.');
		}
		const tiferesSubject = `[Awtsmoos ${malchusRecord.kind}] ${malchusRecord.subject} — ${malchusRecord.reference}`;
		const tiferesBody = [
			`Reference: ${malchusRecord.reference}`,
			`Type: ${malchusRecord.kind}`,
			`From: ${malchusRecord.name} <${malchusRecord.email}>`,
			'',
			String(malchusRecord.message)
		].join('\n');
		await yesodMailer.sendMail(TIFERES_SENDER, TIFERES_RECIPIENT, tiferesSubject, tiferesBody, {
			'Reply-To': malchusRecord.email
		});
	}

	/**
	 * Stores a delivered signal when the runtime exposes persistence, preserving optional-storage behavior.
	 *
	 * @param {object} tiferesContext Dynamic-route context.
	 * @param {Record<string, unknown>} malchusRecord Contact record including reference and timestamp.
	 * @returns {Promise<void>}
	 */
	async persist(tiferesContext, malchusRecord) {
		if (tiferesContext.db?.write) {
			await tiferesContext.db.write(`/contactSignals/${malchusRecord.reference}`, malchusRecord);
		}
	}
}

module.exports = { TiferesContactDelivery };
