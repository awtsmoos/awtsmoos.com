// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudState.js
 * @description Owns accessible state for intention, posture, knowledge, boss, quest, subtitles, and feedback.
 * The Awtsmoos renews every combat sign while the HUD remembers only bounded public truth;
 * Awtsmoos.com keeps labels, meters, patterns, authority, reward, recovery, and audio alternatives concise.
 */

export function createMinimalMeadowVerticalSliceHudState() {
	return {
		boss: null,
		daas: null,
		feedback: 'Observe shape, label, border, position, and timing.',
		feedbackState: 'ready',
		kavanah: null,
		posture: null,
		quest: null
	};
}

export function reduceMinimalMeadowVerticalSliceHud(
	state,
	eventName,
	detail = {}
) {
	if (eventName.startsWith('combat:kavanah')) {
		state.kavanah = normalizeKavanah(eventName, detail);
	}
	if (eventName === 'combat:posture') {
		state.posture = normalizePosture(detail);
	}
	if (eventName === 'daas:learned') state.daas = detail;
	if (eventName === 'boss:phase') state.boss = detail;
	if (eventName.startsWith('teaching-quest:')) state.quest = detail;
	const feedback = feedbackFor(eventName, detail);
	if (feedback) Object.assign(state, feedback);
	return state;
}

function normalizeKavanah(eventName, detail) {
	const value = detail.kavanah || detail;
	if (eventName.includes('cancel')) return null;
	return {
		actionId: value.actionId || null,
		active: eventName.includes('start') || Boolean(value.active),
		aligned: Boolean(value.aligned || value.evaluation?.aligned),
		progress: kavanahProgress(value),
		stability: Number(value.stability ?? value.evaluation?.stability ?? 1),
		tier: value.tier || value.evaluation?.tier || 'preparing'
	};
}

function normalizePosture(detail) {
	const maximum = Math.max(1, Number(detail.maximum || 100));
	return {
		broken: Boolean(detail.broken || detail.reason === 'broken'),
		maximum,
		reason: detail.reason || 'stable',
		value: Math.max(
			0,
			Math.min(maximum, Number(detail.value ?? maximum))
		)
	};
}

function kavanahProgress(value) {
	const elapsed = Number(value.elapsedMilliseconds || 0);
	const duration = Number(value.durationMilliseconds || 1000);
	return Math.max(0, Math.min(1, elapsed / Math.max(1, duration)));
}

function feedbackFor(eventName, detail) {
	if (eventName === 'audio:subtitle') {
		return {
			feedback: detail.subtitle || 'Gameplay audio cue.',
			feedbackState: 'subtitle'
		};
	}
	const map = {
		'boss:defeated': ['Kedem Warden defeated. Reward claim checked exactly once.', 'success'],
		'combat:cleanse': ['Stabilizing cleanse removed one bounded harmful state.', 'success'],
		'combat:kavanah-authority-failed': [`Kavanah authority failed: ${detail.error || 'unknown error'}`, 'danger'],
		'combat:reaction': [detail.text || `Reaction: ${detail.id}`, 'success'],
		'combat:support-authority-failed': [`Support authority failed: ${detail.error || 'unknown error'}`, 'danger'],
		'enemy:cast-interrupted': ['Hostile cast interrupted.', 'success'],
		'reward:granted': ['Vessel of Measured Intent granted once.', 'success'],
		'teaching-quest:completed': ['Teaching quest complete.', 'success']
	};
	const found = map[eventName];
	return found
		? { feedback: found[0], feedbackState: found[1] }
		: null;
}
