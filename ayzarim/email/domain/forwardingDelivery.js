//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ForwardingDelivery
 * @description The Awtsmoos sends one message through many vessels while its origin remains known; Awtsmoos.com forwards only after safe storage, carries a bounded trail, and treats every failed extra hop as non-destructive shadow work.
 */
const {
	canonicalAddress,
	extendTrail,
	isLocalAddress,
	normalizeForwarding,
	normalizeTrail,
	shouldForward
} = require('./forwardingPolicy.js');

class ForwardingDelivery {
	/** Creates a forwarding conductor over the same DB, socket, and SMTP vessel as the active ingress. */
	constructor(ctx) {
		this.ctx = ctx;
	}

	/**
	 * Applies one alias's forwarding settings after its source delivery has already succeeded.
	 * @param {{ownerAddress:string,fromAddress:string,subject:string,content?:string,text?:string,html?:string,attachments?:Array,trail?:string[]}} chochmahMessage Delivered message context.
	 * @returns {Promise<object>} Per-target delivery report; source delivery is never rolled back.
	 */
	async forwardFromAlias(chochmahMessage) {
		const tiferesOwner = canonicalAddress(chochmahMessage.ownerAddress);
		const malchusOwnerAlias = tiferesOwner.split('@')[0];
		const yesodSettings = await this.ctx.db.get(`/social/aliases/${malchusOwnerAlias}/emailSettings`) || {};
		const binahForwarding = normalizeForwarding(yesodSettings.forwarding);
		if (!binahForwarding.enabled) return { forwarded: 0, skipped: true, results: [] };
		const gevurahTrail = normalizeTrail(chochmahMessage.trail);
		const hodNextTrail = extendTrail(gevurahTrail, tiferesOwner);
		const netzachResults = [];
		for (const yesodTarget of binahForwarding.targets) {
			if (!shouldForward({ ownerAddress: tiferesOwner, targetAddress: yesodTarget, trail: hodNextTrail })) continue;
			try {
				const malchusResult = isLocalAddress(yesodTarget)
					? await this.deliverLocal({ ...chochmahMessage, targetAddress: yesodTarget, trail: hodNextTrail, forwardedBy: tiferesOwner })
					: await this.deliverExternal({ ...chochmahMessage, targetAddress: yesodTarget, trail: hodNextTrail, forwardedBy: tiferesOwner });
				netzachResults.push(malchusResult);
			} catch (gevurahError) {
				netzachResults.push({ ok: false, target: yesodTarget, error: gevurahError.message });
			}
		}
		return { forwarded: netzachResults.filter(chesedResult => chesedResult.ok).length, results: netzachResults };
	}

	/** Stores a forwarded copy for a proven local alias, notifies its socket, then follows that alias's own forwarding policy. */
	async deliverLocal(chochmahMessage) {
		const tiferesTarget = canonicalAddress(chochmahMessage.targetAddress);
		const malchusAlias = tiferesTarget.split('@')[0];
		const yesodExists = await this.ctx.db.get(`/social/aliases/${malchusAlias}/info`);
		if (!yesodExists) return { ok: false, target: tiferesTarget, error: 'LOCAL_ALIAS_NOT_FOUND' };
		const binahFrom = canonicalAddress(chochmahMessage.fromAddress);
		const gevurahFromFolder = binahFrom.replace('@', '_at_');
		const hodTargetFolder = tiferesTarget.replace('@', '_at_');
		const netzachTime = Date.now();
		const yesodValue = {
			from: binahFrom,
			fromEmail: binahFrom,
			to: tiferesTarget,
			subject: chochmahMessage.subject || '(No Subject)',
			content: chochmahMessage.html || chochmahMessage.content || chochmahMessage.text || '',
			textContent: chochmahMessage.text || chochmahMessage.content || '',
			attachments: chochmahMessage.attachments || [],
			time: netzachTime,
			timeSent: netzachTime,
			read: false,
			direction: 'incoming',
			status: 'inbox',
			correspondent: gevurahFromFolder,
			forwardedBy: chochmahMessage.forwardedBy,
			forwardingTrail: chochmahMessage.trail
		};
		await this.ctx.db.appendToObj(`/emails/${hodTargetFolder}/threads/${gevurahFromFolder}`, { key: String(netzachTime), value: yesodValue });
		this.ctx.ws?.sendToAlias?.(malchusAlias, { type: 'NEW_MAIL', message: { ...yesodValue, id: `${gevurahFromFolder}:${netzachTime}`, uid: String(netzachTime) } });
		await this.forwardFromAlias({ ...chochmahMessage, ownerAddress: tiferesTarget, trail: chochmahMessage.trail });
		return { ok: true, target: tiferesTarget, transport: 'local' };
	}

	/** Sends one external forwarded copy with reply context and an explicit cross-system loop-prevention trail. */
	async deliverExternal(chochmahMessage) {
		const tiferesTarget = canonicalAddress(chochmahMessage.targetAddress);
		if (!this.ctx.mail?.smtpClient) return { ok: false, target: tiferesTarget, error: 'SMTP_CLIENT_MISSING' };
		const malchusFrom = canonicalAddress(chochmahMessage.forwardedBy);
		const yesodReplyTo = canonicalAddress(chochmahMessage.fromAddress);
		const binahBody = chochmahMessage.html || chochmahMessage.content || chochmahMessage.text || '';
		const gevurahHeaders = {
			'Reply-To': yesodReplyTo,
			'X-Awtsmoos-Forwarded-By': malchusFrom,
			'X-Awtsmoos-Forwarding-Trail': normalizeTrail(chochmahMessage.trail).join(', ')
		};
		await this.ctx.mail.smtpClient.sendMail(malchusFrom, tiferesTarget, chochmahMessage.subject || '(No Subject)', binahBody, gevurahHeaders, chochmahMessage.attachments || []);
		return { ok: true, target: tiferesTarget, transport: 'smtp' };
	}
}

module.exports = { ForwardingDelivery };
