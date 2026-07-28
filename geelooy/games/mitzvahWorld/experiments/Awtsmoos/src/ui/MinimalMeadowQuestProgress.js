// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestProgress.js
 * @description Builds three-archetype defeat and corpse-recovery progress with current objective text.
 * The Awtsmoos counts battle and careful gathering as separate lights; Awtsmoos.com lets each
 * face reveal whether its danger remains, has fallen, or has been fully recovered from darkness.
 */

export function minimalMeadowQuestProgressMarkup(snapshot, context = 'tracker') {
	const archetypes = snapshot.definition.requiredArchetypes || [];
	const defeated = new Set(snapshot.defeatedArchetypes || []);
	const looted = new Set(snapshot.lootedArchetypes || []);
	const faces = archetypes.map((archetype, index) => {
		const recovered = looted.has(archetype);
		const conquered = defeated.has(archetype);
		const state = conquered ? 'defeated' : 'remaining';
		const label = recovered ? 'recovered' : conquered ? 'defeated' : 'remaining';
		const face = snapshot.definition.faces?.[index] || '👹';
		return `<span data-state="${state}" data-recovered="${recovered}" aria-label="${escapeHtml(archetype)}: ${label}">${escapeHtml(face)}</span>`;
	}).join('');
	const percentage = completionPercentage(snapshot, archetypes.length);
	return `
		<div class="quest-progress" data-context="${escapeHtml(context)}">
			<div class="quest-face-row">${faces}</div>
			<div class="quest-progress-line"><i style="width:${percentage}%"></i></div>
			<small>${percentage}% complete · ${escapeHtml(minimalMeadowQuestObjectiveText(snapshot))}</small>
		</div>`;
}

export function minimalMeadowQuestObjectiveText(snapshot) {
	const objective = snapshot.currentObjective || snapshot.definition.objective;
	return `${objective.description}: ${objective.progress}/${objective.count}`;
}

function completionPercentage(snapshot, count) {
	if (['ready', 'completed'].includes(snapshot.status)) return 100;
	const completedSteps = Number(snapshot.defeatProgress || 0)
		+ Number(snapshot.lootProgress || 0);
	return Math.round(completedSteps / Math.max(1, count * 2) * 100);
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
