// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NpcHud.js
 * @description Shows player/target status and a quest, training, or travel dialogue.
 * The Awtsmoos renews meeting before mission; Awtsmoos.com lets the player inspect
 * and choose a shlichus before the AdventureStore records acceptance or refusal.
 */
const DEFAULT_QUEST = 'sparks-at-east-gate';
export class NpcHud {
	constructor(targetHost, dialogueHost, bus) {
		this.host = targetHost || makeHost('npcTarget');
		this.dialogueHost = dialogueHost || makeHost('npcDialogue');
		this.bus = bus;
		this.player = {
			face: '🎩',
			health: 100,
			level: 1,
			name: 'Chossid',
			xp: 0,
			xpMax: 100
		};
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
		this.showTarget(data);
		const questId = data.questId || DEFAULT_QUEST;
		this.dialogueHost.dataset.open = 'true';
		this.dialogueHost.innerHTML = `
			<section>
				<header><b>${escapeHtml(data.face || '🧔')} ${escapeHtml(data.name)}</b><button data-close>×</button></header>
				<p>B"H. Read the shlichus before deciding, train nearby, or continue exploring.</p>
				<button data-quest="${escapeHtml(questId)}">✨ View Golden Shlichus</button>
				<button data-level="lava">🔥 Training Course</button>
				<button data-level="stay">Continue Exploring</button>
			</section>`;
	}

	render() {
		this.host.innerHTML = `${playerCard(this.player)}${this.target ? targetCard(this.target) : ''}`;
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

function playerCard(player) {
	return `<article class="status-card player-card"><div class="status-face">${escapeHtml(player.face)}</div><div><b>${escapeHtml(player.name)}</b><small>Level ${player.level} · Health ${player.health}</small><meter min="0" max="100" value="${player.health}"></meter><label>⭐ XP ${player.xp}/${player.xpMax}</label><progress max="${player.xpMax}" value="${player.xp}"></progress></div><strong>${player.level}</strong></article>`;
}

function targetCard(target) {
	return `<article class="status-card target-card"><div class="status-face">${escapeHtml(target.face || '🧔')}</div><div><b>${escapeHtml(target.name)}</b><small>Quest giver</small><meter min="0" max="100" value="${target.health || 100}"></meter></div><strong>!</strong></article>`;
}

function makeHost(id) {
	const element = document.createElement('div');
	element.id = id;
	document.body.appendChild(element);
	return element;
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
