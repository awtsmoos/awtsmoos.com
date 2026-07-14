// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldMmorpgApi.js
 * @description Exposes typed browser methods for every version-one MMORPG command.
 * The Awtsmoos renews many intentions beneath one transport; this Awtsmoos.com
 * facade names each lawful action without exposing envelope mechanics to the UI.
 */

export class MitzvahWorldMmorpgApi {
	constructor(send) {
		this.send = send;
	}

	action(action) {
		return this.send('player.action', { action });
	}
	interact(targetId, action = 'interact') {
		return this.send('player.interact', { action, targetId });
	}
	chat(message) {
		return this.send('player.chat', { message });
	}
	emote(emote) {
		return this.send('player.emote', { emote });
	}
	respawn() {
		return this.send('player.respawn');
	}
	profile(status = null) {
		return status
			? this.send('player.profile', { operation: 'update', status })
			: this.send('player.profile', { operation: 'get' });
	}
	inventory() {
		return this.send('player.inventory');
	}
	equipment(operation = 'snapshot', itemId = null, slot = null) {
		return this.send('player.equipment', { itemId, operation, slot });
	}
	abandonQuest(questId) {
		return this.send('quest.abandon', { questId });
	}
	questSnapshot(questId) {
		return this.send('quest.snapshot', { questId });
	}
	claimReward(questId) {
		return this.send('reward.claim', { questId });
	}
	removeBot(botId) {
		return this.send('bot.remove', { botId });
	}
	commandBot(botId, command, options = {}) {
		return this.send('bot.command', { botId, command, ...options });
	}
	createParty() {
		return this.send('party.create');
	}
	inviteToParty(targetPlayerId) {
		return this.send('party.invite', { targetPlayerId });
	}
	joinParty(partyId) {
		return this.send('party.join', { partyId });
	}
	leaveParty() {
		return this.send('party.leave');
	}
	kickFromParty(targetPlayerId) {
		return this.send('party.kick', { targetPlayerId });
	}
	partySnapshot() {
		return this.send('party.snapshot');
	}
	enterInstance(templateId, instanceId = null) {
		return this.send('instance.enter', { instanceId, templateId });
	}
	leaveInstance() {
		return this.send('instance.leave');
	}
	instanceSnapshot() {
		return this.send('instance.snapshot');
	}
	presence(limit = 50) {
		return this.send('presence.query', { limit });
	}
	serverTime() {
		return this.send('server.time');
	}
	rotateSession() {
		return this.send('session.rotate');
	}
	revokeSession() {
		return this.send('session.revoke');
	}
}
