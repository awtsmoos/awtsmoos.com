//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module IngressRulesRunner
 * @description The Awtsmoos lets lawful automation answer without becoming the mail transport itself; Awtsmoos.com keeps AI streaming, structured rules, legacy scripts, and reply delivery inside one guarded post-inbox service.
 */
const vm = require('vm');
const rulesEngine = require('../awtsmoosEmailRules.js');
const { IngressSystemReply } = require('./systemReply.js');

class IngressRulesRunner {
	/**
	 * Creates the post-inbox automation conductor around the static-server context.
	 * @param {object} malchusContext Server context with ws/callAi/mail/db vessels.
	 */
	constructor(malchusContext) {
		this.malchusContext = malchusContext;
		this.tiferesReplies = new IngressSystemReply(malchusContext);
	}

	/**
	 * Runs structured rules followed by the historical sandboxed script only for a safely delivered inbox message.
	 * @param {{settings:object,recipientAlias:string,recipientAddress:string,senderAddress:string,senderFolder:string,subject:string,text:string}} chochmahContext Automation context.
	 * @returns {Promise<void>} Resolves after supported automations have completed.
	 */
	async run(chochmahContext) {
		await rulesEngine.processRules({
			settings: chochmahContext.settings,
			msg: this.messageShape(chochmahContext),
			dependencies: {
				callAi: this.malchusContext.callAi?.bind?.(this.malchusContext) || null,
				stream: tiferesPartial => this.stream(chochmahContext, tiferesPartial),
				reply: malchusText => this.reply(chochmahContext, malchusText),
				console
			}
		});
		this.runLegacyScript(chochmahContext);
	}

	/**
	 * Builds the rules-engine message shape without exposing server internals to automation code.
	 * @param {object} tiferesContext Current automation context.
	 * @returns {object} Stable rule message.
	 */
	messageShape(tiferesContext) {
		return {
			from: tiferesContext.senderAddress,
			to: tiferesContext.recipientAddress,
			subject: tiferesContext.subject,
			content: tiferesContext.text
		};
	}

	/**
	 * Emits AI/rule ghost typing to the recipient exactly where the Mail UI already listens.
	 * @param {object} chochmahContext Automation context.
	 * @param {string} tiferesPartial Partial generated content.
	 */
	stream(chochmahContext, tiferesPartial) {
		this.malchusContext.ws?.sendToAlias?.(chochmahContext.recipientAlias, {
			type: 'LIVE_PREVIEW',
			from: chochmahContext.senderFolder,
			content: tiferesPartial
		});
	}

	/**
	 * Sends one structured-rule reply through the shared ingress system-reply service.
	 * @param {object} chochmahContext Automation context.
	 * @param {unknown} malchusText Generated reply.
	 * @returns {Promise<object>} Reply evidence.
	 */
	async reply(chochmahContext, malchusText) {
		return this.tiferesReplies.send({
			fromAlias: chochmahContext.recipientAlias,
			toEmail: chochmahContext.senderAddress,
			subject: `Re: ${chochmahContext.subject}`,
			body: String(malchusText || ''),
			saveToSent: true
		});
	}

	/**
	 * Executes the backwards-compatible custom script inside a one-second sandbox with no direct server object access.
	 * @param {object} chochmahContext Automation context.
	 */
	runLegacyScript(chochmahContext) {
		if (!chochmahContext.settings?.customScript) return;
		const tiferesSandbox = {
			msg: this.messageShape(chochmahContext),
			reply: malchusText => this.reply(chochmahContext, malchusText),
			console: { log: () => {} }
		};
		vm.createContext(tiferesSandbox);
		try {
			vm.runInContext(chochmahContext.settings.customScript, tiferesSandbox, { timeout: 1000 });
		} catch (gevurahError) {
			console.error('B"H - Legacy mail rule script failed', gevurahError.message);
		}
	}
}

module.exports = { IngressRulesRunner };
