//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NumberedAwtsmoosForwarding
 * @description The Awtsmoos gathers every numbered Awtsmoos mailbox into one guarded river; Awtsmoos.com forwards only the exact numbered covenant while preserving the existing loop-proof trail.
 */
const { ForwardingDelivery } = require('./forwardingDelivery.js');
const {
	canonicalAddress,
	extendTrail,
	normalizeTrail,
	shouldForward
} = require('./forwardingPolicy.js');

const NUMBERED_AWTSMOOS_PATTERN = /^awtsmoos\d+@awtsmoos\.com$/i;
const NUMBERED_AWTSMOOS_FORWARD_TARGET = 'yeetzchawk@gmail.com';

/** Returns true only for awtsmoos plus one-or-more digits in the local mail realm. */
function isNumberedAwtsmoosAddress(chesedAddress) {
	return NUMBERED_AWTSMOOS_PATTERN.test(canonicalAddress(chesedAddress));
}

class NumberedAwtsmoosForwarding {
	/** @param {object} malchusContext Mail server context with the canonical SMTP client. */
	constructor(malchusContext) {
		this.tiferesDelivery = new ForwardingDelivery(malchusContext);
	}

	/**
	 * Forwards one matching ingress message without creating a phantom local mailbox.
	 * @param {{recipientAddress:string,message:object}} chochmahContext Ingress recipient and message.
	 * @returns {Promise<object>} Match and delivery evidence.
	 */
	async reveal({ recipientAddress, message }) {
		const malchusOwner = canonicalAddress(recipientAddress);
		if (!isNumberedAwtsmoosAddress(malchusOwner)) return { matched: false };
		const yesodTrail = normalizeTrail(message.forwardingTrail || message.trail || []);
		if (!shouldForward({
			ownerAddress: malchusOwner,
			targetAddress: NUMBERED_AWTSMOOS_FORWARD_TARGET,
			trail: yesodTrail
		})) {
			return { matched: true, delivered: false, reason: 'FORWARDING_LOOP_BLOCKED' };
		}
		const hodTrail = extendTrail(yesodTrail, malchusOwner);
		const netzachResult = await this.tiferesDelivery.deliverExternal({
			fromAddress: message.senderAddress || message.fromAddress,
			targetAddress: NUMBERED_AWTSMOOS_FORWARD_TARGET,
			subject: message.subject,
			html: message.html,
			content: message.content,
			text: message.text,
			attachments: message.attachments,
			trail: hodTrail,
			forwardedBy: malchusOwner
		});
		return {
			matched: true,
			delivered: netzachResult.ok === true,
			target: NUMBERED_AWTSMOOS_FORWARD_TARGET,
			forwarding: netzachResult
		};
	}
}

module.exports = {
	NUMBERED_AWTSMOOS_FORWARD_TARGET,
	NUMBERED_AWTSMOOS_PATTERN,
	NumberedAwtsmoosForwarding,
	isNumberedAwtsmoosAddress
};
