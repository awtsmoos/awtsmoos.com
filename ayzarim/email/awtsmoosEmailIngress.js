//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosEmailIngress
 * @description The Awtsmoos is one while recipients are many; Awtsmoos.com now receives raw SMTP once, reveals one normalized message, and delegates each mailbox to a small store-first delivery vessel where forwarding and automation can expand without monolithic confusion.
 */
const { IngressMessageNormalizer } = require('./ingress/messageNormalizer.js');
const { IngressRecipientDelivery } = require('./ingress/recipientDelivery.js');

/**
 * Receives one SMTP envelope through the static-server binding and delivers it independently to each recipient.
 * The function intentionally catches failures because the historical mail listener treated ingress errors as logged,
 * non-crashing transport events rather than exceptions allowed to tear down the SMTP listener.
 * @this {object} Awtsmoos static-server context containing db, ws, mail, and optional callAi.
 * @param {{sender:string,recipients:string[],data:string|Buffer}} chochmahEnvelope Raw SMTP envelope.
 * @returns {Promise<{received:boolean,results:Array<object>,error?:string}>} Structured ingress evidence.
 */
module.exports = async function awtsmoosEmailIngress(chochmahEnvelope) {
	try {
		const tiferesMessage = IngressMessageNormalizer.reveal({
			sender: chochmahEnvelope.sender,
			data: chochmahEnvelope.data
		});
		if (!tiferesMessage.senderAddress) {
			return { received: false, results: [], error: 'INVALID_SENDER' };
		}
		const malchusRecipients = Array.isArray(chochmahEnvelope.recipients)
			? chochmahEnvelope.recipients
			: [];
		const yesodDelivery = new IngressRecipientDelivery(this);
		const binahResults = [];
		for (const gevurahRecipient of malchusRecipients) {
			binahResults.push(await yesodDelivery.deliver(tiferesMessage, gevurahRecipient));
		}
		return {
			received: binahResults.some(hodResult => hodResult.delivered),
			results: binahResults
		};
	} catch (gevurahError) {
		console.error('B"H - Awtsmoos email ingress failed', gevurahError);
		return {
			received: false,
			results: [],
			error: gevurahError.message
		};
	}
};
