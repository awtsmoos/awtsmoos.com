// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcHud.js
 * @description Coordinates event-driven player progression, target vitality, and friendly dialogue.
 * The Awtsmoos renews meeting and challenge beneath one visible truth; Awtsmoos.com updates this
 * HUD only when profile, target, damage, respawn, or dialogue events make new truth visible.
 */

import { npcDialogueMarkup, npcPlayerCard, npcTargetCard } from './NpcHudMarkup.js';

const DEFAULT_QUEST = 'sparks-at-east-gate';

export class NpcHud {
	constructor(targetHost, dialogueHost, bus) {
		this.host = targetHost || makeHost('npcTarget');
		this.dialogueHost = dialogueHost || makeHost('npcDialogue');
		this.bus = bus;
		this.player = defaultPlayer();
		this.target = null;
		this.unsubscribers = [];
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-status-dock');
		this.dialogueHost.classList.add('Awtsmoos-npc-dialogue');
		this.dialogueHost.dataset.open = 'false';
		this.listen('npc:target', data => this.showTarget(data));
		this.listen('npc:dialogue', data => this.showDialogue(data));
		this.listen('npc:clear', () => this.clearTarget());
		this.listen('profile:state', data => this.updatePlayer(data));
		this.listen('enemy:damaged', data => this.refreshTarget(data));
		this.listen('enemy:respawn', data => this.refreshTarget(data));
		this.listen('enemy:attack', data => this.applyEnemyDamage(data));
		this.dialogueHost.addEventListener('click', event => this.click(event));
		this.render();
	}

	listen(type, listener) {
		this.unsubscribers.push(this.bus.on(type, listener));
	}

	updatePlayer(data = {}) {
		this.player = { ...this.player, ...data };
		this.render();
	}

	applyEnemyDamage(data = {}) {
		const amount = Math.max(0, Number(data.event?.amount) || 0);
		this.updatePlayer({ health: Math.max(0, this.player.health - amount) });
	}

	showTarget(data) {
		this.target = data;
		this.render();
	}

	refreshTarget(data) {
		if (!this.target || targetIdentity(this.target) !== targetIdentity(data)) return;
		this.showTarget(data);
	}

	clearTarget() {
		this.target = null;
		this.close();
		this.render();
	}

	showDialogue(data) {
		if (data.faction === 'hostile') return;
		this.showTarget(data);
		const questId = data.questId || DEFAULT_QUEST;
		this.dialogueHost.dataset.open = 'true';
		this.dialogueHost.innerHTML = npcDialogueMarkup(data, questId);
	}

	render() {
		this.host.innerHTML = `${npcPlayerCard(this.player)}${this.target ? npcTargetCard(this.target) : ''}`;
		this.host.dataset.hasTarget = String(Boolean(this.target));
	}

	click(event) {
		const close = event.target.closest('[data-close]');
		const quest = event.target.closest('[data-quest]');
		const level = event.target.closest('[data-level]');
		if (quest) {
			this.bus.emit('quest:offer', { questId: quest.dataset.quest });
			return this.close();
		}
		if (level?.dataset.level === 'lava') {
			this.bus.emit('level:lava', { from: this.target });
			return this.close();
		}
		if (close || level?.dataset.level === 'stay') this.close();
	}

	close() { this.dialogueHost.dataset.open = 'false'; }

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function defaultPlayer() {
	return { armor: 3, face: '🎩', health: 100, level: 1, maxHealth: 100, name: 'Chossid', xp: 0, xpMax: 200 };
}

function targetIdentity(target) {
	return target?.targetId || target?.id || null;
}

function makeHost(id) {
	const element = document.createElement('div');
	element.id = id;
	document.body.appendChild(element);
	return element;
}
