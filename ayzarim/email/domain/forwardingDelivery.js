//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ForwardingDelivery
 * @description Delivers one stored message through the effective user-wide plus alias-specific forwarding policy while preserving HTML bodies and genuine attachments.
 * The Awtsmoos is one while destinations are many; Awtsmoos.com joins the user's broad covenant with the alias's particular path without duplicating targets or turning living HTML into a dead file.
 */
const {
	canonicalAddress,
	extendTrail,
	isLocalAddress,
	normalizeTrail,
	shouldForward
} = require('./forwardingPolicy.js');
const { prepareForwardingBody } = require('./forwardingBody.js');
const { resolveForwardingSettings } = require('./forwardingSettingsResolver.js');

class ForwardingDelivery {
	/** Creates a forwarding conductor over the active database, socket, and SMTP vessels. */
	constructor(ctx) {
		this.ctx = ctx;
	}

	/** Applies the effective user + alias forwarding policy after source delivery succeeds. */
	async forwardFromAlias(message) {
		const ownerAddress = canonicalAddress(message.ownerAddress);
		const resolved = await resolveForwardingSettings(this.ctx.db, ownerAddress);
		const policy = resolved.effectiveForwarding;
		if (!policy.enabled) return { forwarded: 0, skipped: true, results: [] };
		const trail = extendTrail(normalizeTrail(message.trail), ownerAddress);
		const results = [];
		for (const targetAddress of policy.targets) {
			if (!shouldForward({ ownerAddress, targetAddress, trail })) continue;
			try {
				const result = isLocalAddress(targetAddress)
					? await this.deliverLocal({ ...message, targetAddress, trail, forwardedBy: ownerAddress })
					: await this.deliverExternal({ ...message, targetAddress, trail, forwardedBy: ownerAddress });
				results.push(result);
			} catch (error) {
				results.push({ ok: false, target: targetAddress, error: error.message });
			}
		}
		return { forwarded: results.filter(result => result.ok).length, results };
	}

	/** Stores a forwarded copy for a proven local alias and follows that alias's own effective policy. */
	async deliverLocal(message) {
		const targetAddress = canonicalAddress(message.targetAddress);
		const targetAlias = targetAddress.split('@')[0];
		const aliasExists = await this.ctx.db.get(`/social/aliases/${targetAlias}/info`);
		if (!aliasExists) return { ok: false, target: targetAddress, error: 'LOCAL_ALIAS_NOT_FOUND' };
		const fromAddress = canonicalAddress(message.fromAddress);
		const fromFolder = fromAddress.replace('@', '_at_');
		const targetFolder = targetAddress.replace('@', '_at_');
		const time = Date.now();
		const value = {
			from: fromAddress,
			fromEmail: fromAddress,
			to: targetAddress,
			subject: message.subject || '(No Subject)',
			content: message.html || message.content || message.text || '',
			textContent: message.text || message.content || '',
			attachments: message.attachments || [],
			time,
			timeSent: time,
			read: false,
			direction: 'incoming',
			status: 'inbox',
			correspondent: fromFolder,
			forwardedBy: message.forwardedBy,
			forwardingTrail: message.trail
		};
		await this.ctx.db.appendToObj(`/emails/${targetFolder}/threads/${fromFolder}`, { key: String(time), value });
		this.ctx.ws?.sendToAlias?.(targetAlias, { type: 'NEW_MAIL', message: { ...value, id: `${fromFolder}:${time}`, uid: String(time) } });
		await this.forwardFromAlias({ ...message, ownerAddress: targetAddress, trail: message.trail });
		return { ok: true, target: targetAddress, transport: 'local' };
	}

	/** Sends one external copy with visible HTML body, original attachments, and bounded loop-prevention headers. */
	async deliverExternal(message) {
		const targetAddress = canonicalAddress(message.targetAddress);
		if (!this.ctx.mail?.smtpClient) return { ok: false, target: targetAddress, error: 'SMTP_CLIENT_MISSING' };
		const forwardedBy = canonicalAddress(message.forwardedBy);
		const replyTo = canonicalAddress(message.fromAddress);
		const prepared = prepareForwardingBody(message);
		const headers = {
			'Reply-To': replyTo,
			'X-Awtsmoos-Forwarded-By': forwardedBy,
			'X-Awtsmoos-Forwarding-Trail': normalizeTrail(message.trail).join(', '),
			'X-Awtsmoos-Body-Format': prepared.isHtml ? 'html' : 'text'
		};
		await this.ctx.mail.smtpClient.sendMail(
			forwardedBy,
			targetAddress,
			message.subject || '(No Subject)',
			prepared.body,
			headers,
			message.attachments || []
		);
		return { ok: true, target: targetAddress, transport: 'smtp' };
	}
}

module.exports = { ForwardingDelivery };
