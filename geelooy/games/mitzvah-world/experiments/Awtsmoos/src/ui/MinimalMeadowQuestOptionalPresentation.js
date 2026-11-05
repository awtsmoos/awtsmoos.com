// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestOptionalPresentation.js
 * @description Renders nonblocking Shlichus excellence and completed honors across parchment and menu.
 * The Awtsmoos lets optional beauty remain visible without becoming a gate; Awtsmoos.com gives
 * courage, teaching, recovery, bonuses, and honors one shared truthful language in every quest surface.
 */

export function minimalMeadowOptionalObjectivesMarkup(
	objectives = [],
	context = 'dialog'
) {
	if (!objectives.length) return '';
	return `
		<section class="Awtsmoos-optional-objectives" data-context="${escapeHtml(context)}">
			<header><strong>Optional excellence</strong><small>These never block completion.</small></header>
			${objectives.map(objectiveMarkup).join('')}
		</section>`;
}

export function minimalMeadowCompletionHonorsMarkup(receipt = {}) {
	const honors = receipt.honors || [];
	const bonus = receipt.optionalReward || { perutas: 0, xp: 0 };
	if (!honors.length && !bonus.perutas && !bonus.xp) return '';
	return `
		<section class="Awtsmoos-quest-honors">
			<strong>Excellence remembered</strong>
			${honors.map(value => `<span>🏅 ${escapeHtml(value)}</span>`).join('')}
			${bonus.xp ? `<span>✨ +${bonus.xp} bonus XP</span>` : ''}
			${bonus.perutas ? `<span>🪙 +${bonus.perutas} bonus perutas</span>` : ''}
		</section>`;
}

function objectiveMarkup(objective) {
	const bonus = bonusText(objective.bonus);
	const mark = objective.complete ? '✓' : `${objective.progress}/${objective.count}`;
	return `
		<article data-complete="${objective.complete}">
			<span>${objective.complete ? '✨' : '○'}</span>
			<div><b>${escapeHtml(objective.description)}</b>${bonus ? `<small>${escapeHtml(bonus)}</small>` : ''}</div>
			<strong>${escapeHtml(mark)}</strong>
		</article>`;
}

function bonusText(bonus = {}) {
	return [
		bonus.honor ? `Honor: ${bonus.honor}` : '',
		bonus.xp ? `+${bonus.xp} XP` : '',
		bonus.perutas ? `+${bonus.perutas} perutas` : ''
	].filter(Boolean).join(' · ');
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>'"]/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
