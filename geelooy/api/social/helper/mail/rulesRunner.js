//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailRulesRunner
 * @description The Awtsmoos lets structured intention answer one inbox event without tangling delivery; Awtsmoos.com keeps rule execution, ghost typing, AI access, and system replies behind one small orchestration vessel.
 */
const { MailSystemDelivery } = require('./systemDelivery.js');

class MailRulesRunner {
	/** Creates a rules conductor around the active request runtime. */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * Executes the existing rules-engine contract after a message has safely entered the recipient inbox.
	 * @param {{settings:object,fromAlias:string,toAlias:string,subject:string,content:string}} chochmahContext Rule context.
	 * @returns {Promise<void>} Resolves after rule processing finishes or immediately when no engine exists.
	 */
	async run(chochmahContext) {
		if (!this.$i.rulesEngine?.processRules) return;
		await this.$i.rulesEngine.processRules({
			settings: chochmahContext.settings,
			msg: {
				from: chochmahContext.fromAlias,
				to: chochmahContext.toAlias,
				subject: chochmahContext.subject,
				content: chochmahContext.content
			},
			dependencies: {
				callAi: this.$i.callAi,
				stream: tiferesPartial => this.revealGhostTyping(chochmahContext, tiferesPartial),
				reply: malchusText => this.revealReply(chochmahContext, malchusText),
				console
			}
		});
	}

	/** Sends live AI/rule typing to both sides exactly as the historical mail engine did. */
	revealGhostTyping(chochmahContext, tiferesPartial) {
		if (!this.$i.ws) return;
		this.$i.ws.sendToAlias(chochmahContext.toAlias, {
			type: 'LIVE_PREVIEW',
			from: chochmahContext.fromAlias,
			content: tiferesPartial
		});
		this.$i.ws.sendToAlias(chochmahContext.fromAlias, {
			type: 'LIVE_PREVIEW',
			from: chochmahContext.toAlias,
			content: tiferesPartial
		});
	}

	/** Routes one rule reply back through the same unified local/SMTP system-delivery service. */
	async revealReply(chochmahContext, malchusText) {
		return new MailSystemDelivery(this.$i).send({
			fromAlias: chochmahContext.toAlias,
			toAddress: `${chochmahContext.fromAlias}@awtsmoos.com`,
			subject: `Re: ${chochmahContext.subject}`,
			content: String(malchusText || '')
		});
	}
}

module.exports = { MailRulesRunner };
