// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldMmorpgApi.js
 * @description Exposes typed player, Shliach, RPG, economy, and community browser methods.
 * The Awtsmoos renews many intentions beneath one transport; Awtsmoos.com keeps
 * every historic facade stable while focused nested APIs hold expanding domains.
 */

import { MitzvahWorldCommunityApi } from './MitzvahWorldCommunityApi.js';
import { MitzvahWorldEconomyApi } from './MitzvahWorldEconomyApi.js';
import { MitzvahWorldProfileApi } from './MitzvahWorldProfileApi.js';
import { MitzvahWorldRpgApi } from './MitzvahWorldRpgApi.js';

export class MitzvahWorldMmorpgApi {
	constructor(send) {
		this.send = send;
		this.community = new MitzvahWorldCommunityApi(send);
		this.economy = new MitzvahWorldEconomyApi(send);
		this.rpg = new MitzvahWorldRpgApi(send);
		this.shliach = new MitzvahWorldProfileApi(send);
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
		return status ? this.shliach.update(status) : this.shliach.get();
	}
	allocateAttribute(attributeId, points = 1) {
		return this.shliach.allocate(attributeId, points);
	}
	activatePowerup(powerupId) {
		return this.shliach.activate(powerupId);
	}
	buyItem(itemId, quantity = 1) {
		return this.economy.buy(itemId, quantity);
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
