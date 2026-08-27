// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcHudMarkup.js
 * @description Renders escaped player, friendly, hostile, level, armor, health, and XP markup.
 * The Awtsmoos reveals inward state through finite letters; Awtsmoos.com keeps every value
 * readable without mixing presentation into combat, progression, or dialogue control flow.
 */

export function npcDialogueMarkup(data, questId) {
	return `
		<section>
			<header><b>${escapeHtml(data.face || '🧔')} ${escapeHtml(data.name)}</b><button data-close>×</button></header>
			<p>B"H. Read the shlichus before deciding, train nearby, or continue exploring.</p>
			<button data-quest="${escapeHtml(questId)}">✨ View Golden Shlichus</button>
			<button data-level="lava">🔥 Training Course</button>
			<button data-level="stay">Continue Exploring</button>
		</section>`;
}

export function npcPlayerCard(player) {
	const maximumHealth = Math.max(1, Number(player.maxHealth) || 100);
	const health = Math.max(0, Math.min(maximumHealth, Number(player.health) || 0));
	const xpMaximum = Math.max(1, Number(player.xpMax) || 200);
	const xp = Math.max(0, Math.min(xpMaximum, Number(player.xp) || 0));
	return `
		<article class="status-card player-card">
			<div class="status-face">${escapeHtml(player.face)}</div>
			<div>
				<b>${escapeHtml(player.name)}</b>
				<small>Level ${player.level} · Health ${health}/${maximumHealth} · Armor ${player.armor || 0}</small>
				<meter min="0" max="${maximumHealth}" value="${health}"></meter>
				<label>⭐ XP ${xp}/${xpMaximum}</label><progress max="${xpMaximum}" value="${xp}"></progress>
			</div><strong>${player.level}</strong>
		</article>`;
}

export function npcTargetCard(target) {
	const maximum = Math.max(1, Number(target.maxHealth || 100));
	const value = Math.max(0, Number(target.health ?? maximum));
	const hostile = target.faction === 'hostile';
	const level = Math.max(1, Math.trunc(Number(target.combatLevel) || 1));
	const armor = Math.max(0, Math.round(Number(target.armor) || 0));
	const detail = hostile
		? `Level ${level} · Health ${value}/${maximum} · Armor ${armor}`
		: escapeHtml(target.role || target.level || 'Village resident');
	return `
		<article class="status-card target-card">
			<div class="status-face">${escapeHtml(target.face || '🧔')}</div>
			<div><b>${escapeHtml(target.name)}</b><small>${detail}</small><meter min="0" max="${maximum}" value="${value}"></meter></div>
			<strong>${hostile ? '⚔' : '!'}</strong>
		</article>`;
}

export function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
