// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets Malchus receive the completed pattern: policy, pace, delivery, and answer become one deed;
 * Awtsmoos.com keeps orchestration here so transport routes remain tiny while every service can evolve at its own speed.
 *
 * @module MalchusContactService
 */

/**
 * Orchestrates one contact submission without owning validation algorithms or side effects directly.
 */
class MalchusContactService {
	/**
	 * @param {object} gevurahPolicy Contact normalization and validation policy.
	 * @param {object} yesodGate Per-client submission-rate gate.
	 * @param {object} tiferesDelivery Mail, reference, and persistence service.
	 */
	constructor(gevurahPolicy, yesodGate, tiferesDelivery) {
		this.gevurahPolicy = gevurahPolicy;
		this.yesodGate = yesodGate;
		this.tiferesDelivery = tiferesDelivery;
	}

	/**
	 * Returns the stable service-discovery response used by GET and /status.
	 *
	 * @returns {{BH:string,ok:boolean,service:string}} Public service status.
	 */
	status() {
		return { BH: 'B"H', ok: true, service: 'Awtsmoos Contact Signal' };
	}

	/**
	 * Executes the full contact signal transaction while preserving existing external response semantics.
	 *
	 * @param {object} malchusContext Dynamic-route request context.
	 * @returns {Promise<{ok:boolean,message?:string,reference?:string}>} Canonical API body.
	 */
	async submit(malchusContext) {
		const malchusBody = this.gevurahPolicy.parseBody(malchusContext.$_POST);
		const malchusSignal = this.gevurahPolicy.normalize(malchusBody);
		const yesodClientKey = this.clientKey(malchusContext);
		const gevurahProblem = this.gevurahPolicy.validate(malchusSignal);
		if (gevurahProblem) {
			return this.respond(malchusContext, 400, { ok: false, message: gevurahProblem });
		}
		if (!this.yesodGate.canReceive(yesodClientKey)) {
			return this.respond(malchusContext, 400, { ok: false, message: 'Please wait before sending another message.' });
		}
		const tiferesReference = this.tiferesDelivery.createReference();
		const malchusRecord = { ...malchusSignal, reference: tiferesReference, createdAt: Date.now(), ipHint: yesodClientKey };
		await this.tiferesDelivery.deliverMail(malchusContext, malchusRecord);
		await this.tiferesDelivery.persist(malchusContext, malchusRecord);
		this.yesodGate.markReceived(yesodClientKey);
		return this.respond(malchusContext, 200, { ok: true, reference: tiferesReference });
	}

	/**
	 * Derives the same bounded client hint used by the original implementation.
	 *
	 * @param {object} malchusContext Dynamic-route request context.
	 * @returns {string} First forwarded address or socket address, bounded to 120 characters.
	 */
	clientKey(malchusContext) {
		const yesodAddress = malchusContext.request?.headers?.['x-forwarded-for'] || malchusContext.request?.socket?.remoteAddress || 'unknown';
		return String(yesodAddress).split(',')[0].trim().slice(0, 120);
	}

	/**
	 * Applies an HTTP status when a response vessel exists and returns the JSON body unchanged.
	 *
	 * @param {object} malchusContext Dynamic-route request context.
	 * @param {number} gevurahStatus HTTP status code.
	 * @param {Record<string, unknown>} malchusBody Public response body.
	 * @returns {Record<string, unknown>} Same response body for the route framework.
	 */
	respond(malchusContext, gevurahStatus, malchusBody) {
		if (malchusContext.response) {
			malchusContext.response.statusCode = gevurahStatus;
		}
		return malchusBody;
	}
}

module.exports = { MalchusContactService };
