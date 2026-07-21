// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcHud.js
 * @description Coordinates player status, target status, and friendly dialogue.
 * The Awtsmoos renews meeting and challenge beneath one visible truth; Awtsmoos.com
 * reveals whether a target offers shlichus or conceals light without confusing either.
 */

import {
	npcDialogueMarkup,
	npcPlayerCard,
	npcTargetCard
} from './NpcHudMarkup.js';

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
		this.unsubscribers.push(this.bus.on('npc:target', data => this.showTarget(data)));
		this.unsubscribers.push(this.bus.on('npc:dialogue', data => this.showDialogue(data)));
		this.unsubscribers.push(this.bus.on('npc:clear', () => this.clearTarget()));
		this.unsubscribers.push(this.bus.on('enemy:attack', data => {
			this.updatePlayer({ health: data.playerHealth });
		}));
		this.dialogueHost.addEventListener('click', event => this.click(event));
		this.render();
	}

	updatePlayer(data = {}) {
		this.player = { ...this.player, ...data };
		this.render();
	}

	showTarget(data) {
		this.target = data;
		this.render();
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
		const targetMarkup = this.target ? npcTargetCard(this.target) : '';
		this.host.innerHTML = `${npcPlayerCard(this.player)}${targetMarkup}`;
		this.host.dataset.hasTarget = String(Boolean(this.target));
	}

	click(event) {
		const close = event.target.closest('[data-close]');
		const quest = event.target.closest('[data-quest]');
		const level = event.target.closest('[data-level]');
		if (quest) {
			this.bus.emit('quest:offer', { questId: quest.dataset.quest });
			this.close();
			return;
		}
		if (level?.dataset.level === 'lava') {
			this.bus.emit('level:lava', { from: this.target });
			this.close();
			return;
		}
		if (close || level?.dataset.level === 'stay') this.close();
	}

	close() {
		this.dialogueHost.dataset.open = 'false';
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function defaultPlayer() {
	return {
		face: '🎩',
		health: 100,
		level: 1,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}

function makeHost(id) {
	const element = document.createElement('div');
	element.id = id;
	document.body.appendChild(element);
	return element;
}
