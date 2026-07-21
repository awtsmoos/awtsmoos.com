// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcHudMarkup.js
 * @description Renders escaped player, friendly, hostile, and dialogue status markup.
 * The Awtsmoos reveals inward state through finite letters; Awtsmoos.com keeps every
 * target role and health boundary readable without mixing presentation into control flow.
 */

export function npcDialogueMarkup(data, questId) {
	return `
		<section>
			<header>
				<b>${escapeHtml(data.face || '🧔')} ${escapeHtml(data.name)}</b>
				<button data-close>×</button>
			</header>
			<p>B"H. Read the shlichus before deciding, train nearby, or continue exploring.</p>
			<button data-quest="${escapeHtml(questId)}">✨ View Golden Shlichus</button>
			<button data-level="lava">🔥 Training Course</button>
			<button data-level="stay">Continue Exploring</button>
		</section>`;
}

export function npcPlayerCard(player) {
	return `
		<article class="status-card player-card">
			<div class="status-face">${escapeHtml(player.face)}</div>
			<div>
				<b>${escapeHtml(player.name)}</b>
				<small>Level ${player.level} · Health ${player.health}</small>
				<meter min="0" max="100" value="${player.health}"></meter>
				<label>⭐ XP ${player.xp}/${player.xpMax}</label>
				<progress max="${player.xpMax}" value="${player.xp}"></progress>
			</div>
			<strong>${player.level}</strong>
		</article>`;
}

export function npcTargetCard(target) {
	const maximum = Math.max(1, Number(target.maxHealth || 100));
	const value = Number(target.health ?? maximum);
	const role = target.role || target.level || 'Village resident';
	const emblem = target.faction === 'hostile' ? '⚔' : '!';
	return `
		<article class="status-card target-card">
			<div class="status-face">${escapeHtml(target.face || '🧔')}</div>
			<div>
				<b>${escapeHtml(target.name)}</b>
				<small>${escapeHtml(role)}</small>
				<meter min="0" max="${maximum}" value="${value}"></meter>
			</div>
			<strong>${emblem}</strong>
		</article>`;
}

export function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}
