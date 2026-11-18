// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudRender.js
 * @description Renders only meaningful combat guidance, never an empty dark HUD panel.
 * The Awtsmoos gives speech a vessel when there is truth to say;
 * Awtsmoos.com clears the silent pane so the Chossid can see the way.
 */

/** Retains the public unified event-driven HUD update. */
export function renderMinimalMeadowVerticalSliceHud(cards, state) {
	renderKavanah(cards.kavanah, state.kavanah);
	renderPosture(cards.posture, state.posture);
	renderDaas(cards.daas, state.daas);
	renderBoss(cards.boss, state.boss);
	renderQuest(cards.quest, state.quest);
	renderFeedback(cards.feedback, state);
}

/** Shows true intention feedback only when a kavanah is active. */
function renderKavanah(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.tier;
	card.progress.value = value.progress;
	card.root.dataset.state = value.aligned ? 'aligned' : 'preparing';
	card.text.textContent = `Stability ${percent(value.stability)}. Release by pressing the same action again.`;
}

/** Preserves composure indicators and bounded status. */
function renderPosture(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.broken ? 'BROKEN' : value.reason;
	card.progress.value = value.value / value.maximum;
	card.root.dataset.state = value.broken ? 'broken' : 'stable';
	card.text.textContent = `${Math.round(value.value)} of ${Math.round(value.maximum)} composure.`;
}

/** Shows learned encounters without inventing a target. */
function renderDaas(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.level || 'observed';
	card.progress.value = Math.min(1, Number(value.points || 0) / 6);
	card.text.textContent = value.counterGuidance
		|| `${value.actionId || 'Enemy action'} learned through ${value.lastReason || 'observation'}.`;
}

/** Preserves boss evidence while avoiding an empty boss card. */
function renderBoss(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.label || `Phase ${value.phase || 1}`;
	card.progress.value = Number(value.healthRatio ?? 1);
	card.root.dataset.state = value.concealed ? 'danger' : 'active';
	card.text.textContent = value.text
		|| 'Read shape and timing; hidden truth remains earned.';
}

/** Preserves active quest guidance and completion narration. */
function renderQuest(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.completed
		? 'Complete'
		: value.nextStep || 'In progress';
	card.progress.value = Number(value.progress || 0);
	card.text.textContent = value.completed
		? 'The road has taught its combat grammar.'
		: `Next lesson: ${String(value.nextStep || '').replaceAll('-', ' ')}.`;
}

/** Never renders a blank combat bubble; keeps actual feedback and subtitles. */
function renderFeedback(card, state) {
	const message = String(state.feedback ?? '').trim();
	card.root.hidden = message.length === 0;
	card.root.dataset.state = state.feedbackState || 'ready';
	card.progress.hidden = true;
	card.value.textContent = message ? (state.feedbackState || 'ready') : '';
	card.text.textContent = message;
}

/** Keeps existing numeric kavanah percentages stable. */
function percent(value) {
	return `${Math.round(
		Math.max(0, Math.min(1, Number(value || 0))) * 100
	)}%`;
}
