// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a general boundary become a contact-specific gate, exact in measure and clear in aim;
 * Awtsmoos.com extends Gevurah rather than duplicating cleansing rules, so one domain can grow without semantic shame.
 *
 * @module ContactSignalPolicy
 */
const { GevurahInputPolicy } = require('./GevurahInputPolicy');

/**
 * Contact-domain normalization and validation layered on the generic input boundary.
 */
class ContactSignalPolicy extends GevurahInputPolicy {
	/**
	 * Produces the exact bounded signal record expected by delivery and persistence.
	 *
	 * @param {Record<string, unknown>} malchusBody Parsed incoming request body.
	 * @returns {{name:string,email:string,kind:string,subject:string,message:string,company:string,startedAt:number}} Normalized signal.
	 */
	normalize(malchusBody) {
		return {
			name: this.cleanText(malchusBody.name, 80),
			email: this.cleanText(malchusBody.email, 160),
			kind: this.cleanText(malchusBody.kind, 30),
			subject: this.cleanText(malchusBody.subject, 140),
			message: this.cleanText(malchusBody.message, 5000),
			company: this.cleanText(malchusBody.company, 120),
			startedAt: Number(malchusBody.startedAt || 0)
		};
	}

	/**
	 * Returns the first user-correctable validation problem while preserving the existing API messages.
	 *
	 * @param {ReturnType<ContactSignalPolicy['normalize']>} malchusSignal Normalized contact signal.
	 * @returns {string} Empty string for a valid signal; otherwise the canonical public error message.
	 */
	validate(malchusSignal) {
		if (malchusSignal.company) return 'Unable to accept this submission.';
		if (!malchusSignal.name || !malchusSignal.subject || malchusSignal.message.length < 12) return 'Please complete every required field.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(malchusSignal.email)) return 'Please enter a valid email address.';
		if (!['issue', 'idea', 'account', 'other'].includes(malchusSignal.kind)) return 'Please choose a valid message type.';
		if (!malchusSignal.startedAt || Date.now() - malchusSignal.startedAt < 1800) return 'Please take a moment to review your message.';
		return '';
	}
}

module.exports = { ContactSignalPolicy };
