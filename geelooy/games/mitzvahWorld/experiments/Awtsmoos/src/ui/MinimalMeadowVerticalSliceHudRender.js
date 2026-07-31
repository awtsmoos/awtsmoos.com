// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudRender.js
 * @description Renders intention, posture, Daas, boss, quest, and textual feedback into accessible cards.
 * The Awtsmoos gives public combat truth many channels without making color sovereign;
 * Awtsmoos.com keeps meter, text, label, pattern, state, and live speech aligned.
 */

export function renderMinimalMeadowVerticalSliceHud(cards, state) {
	renderKavanah(cards.kavanah, state.kavanah);
	renderPosture(cards.posture, state.posture);
	renderDaas(cards.daas, state.daas);
	renderBoss(cards.boss, state.boss);
	renderQuest(cards.quest, state.quest);
	renderFeedback(cards.feedback, state);
}

function renderKavanah(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.tier;
	card.progress.value = value.progress;
	card.root.dataset.state = value.aligned ? 'aligned' : 'preparing';
	card.text.textContent = `Stability ${percent(value.stability)}. Release by pressing the same action again.`;
}

function renderPosture(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.broken ? 'BROKEN' : value.reason;
	card.progress.value = value.value / value.maximum;
	card.root.dataset.state = value.broken ? 'broken' : 'stable';
	card.text.textContent = `${Math.round(value.value)} of ${Math.round(value.maximum)} composure.`;
}

function renderDaas(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.level || 'observed';
	card.progress.value = Math.min(1, Number(value.points || 0) / 6);
	card.text.textContent = value.counterGuidance
		|| `${value.actionId || 'Enemy action'} learned through ${value.lastReason || 'observation'}.`;
}

function renderBoss(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.label || `Phase ${value.phase || 1}`;
	card.progress.value = Number(value.healthRatio ?? 1);
	card.root.dataset.state = value.concealed ? 'danger' : 'active';
	card.text.textContent = value.text
		|| 'Read shape and timing; hidden truth remains earned.';
}

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

function renderFeedback(card, state) {
	card.root.hidden = false;
	card.root.dataset.state = state.feedbackState;
	card.value.textContent = state.feedbackState;
	card.progress.hidden = true;
	card.text.textContent = state.feedback;
}

function percent(value) {
	return `${Math.round(
		Math.max(0, Math.min(1, Number(value || 0))) * 100
	)}%`;
}
