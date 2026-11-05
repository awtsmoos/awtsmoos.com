// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestPresentation.js
 * @description Builds the opening, changing objectives, recovery phase, and meaningful return.
 * The Awtsmoos turns three unlike battles and three deliberate recoveries into one homecoming;
 * Awtsmoos.com lets parchment and tracker speak the same present truth before completion is sealed.
 */

import {
	minimalMeadowQuestCompletionMarkup
} from './MinimalMeadowQuestCompletionPresentation.js';
import {
	minimalMeadowOptionalObjectivesMarkup
} from './MinimalMeadowQuestOptionalPresentation.js';
import {
	minimalMeadowQuestProgressMarkup
} from './MinimalMeadowQuestProgress.js';
import { TEACHING_PLACEMENTS } from './TeachingPlacementPreference.js';

export function minimalMeadowQuestParchmentMarkup(snapshot, placement) {
	if (snapshot.status === 'completed' && snapshot.completionReceipt) {
		return minimalMeadowQuestCompletionMarkup(snapshot);
	}
	const definition = snapshot.definition;
	const story = definition.story || {};
	return `
		<article class="Awtsmoos-quest-parchment" role="dialog" aria-modal="true" aria-labelledby="Awtsmoos-quest-title">
			<button type="button" class="quest-close" data-close aria-label="Close Shlichus">×</button>
			<header class="quest-story-header">
				<p class="Awtsmoos-quest-seal">ב״ה · Royal Shlichus</p>
				<small>${escapeHtml(story.chapter || 'A New Shlichus')}</small>
				<h2 id="Awtsmoos-quest-title">${escapeHtml(definition.name)}</h2>
				<p class="Awtsmoos-quest-giver">From ${escapeHtml(definition.giver.name)} · ${escapeHtml(definition.giver.title || '')}</p>
			</header>
			<section class="quest-story-scroll">
				<p class="quest-opening">${escapeHtml(bodyText(snapshot))}</p>
				${storySection('The danger', story.danger)}
				${storySection('Why this matters', story.purpose)}
				${storySection('Counsel for the road', story.counsel)}
			</section>
			${minimalMeadowQuestProgressMarkup(snapshot, 'dialog')}
			${minimalMeadowOptionalObjectivesMarkup(snapshot.optionalObjectives, 'dialog')}
			${rewardMarkup(definition.reward, 'Promised base reward')}
			<div class="quest-guidance-choice">
				<span>Teaching placement</span>
				<button type="button" data-teaching-placement>${placement === TEACHING_PLACEMENTS.BOOK_ONLY ? '📖 Book only' : '🧭 Show beside world'}</button>
			</div>
			<div class="Awtsmoos-quest-actions">${actionsMarkup(snapshot.status)}</div>
		</article>`;
}

export function minimalMeadowQuestTrackerMarkup(snapshot) {
	const objective = snapshot.currentObjective || snapshot.definition.objective;
	return `
		<div class="quest-tracker-title">
			<b>📜 ${escapeHtml(snapshot.definition.name)}</b>
			<strong>${escapeHtml(objective.description)} · ${objective.progress}/${objective.count}</strong>
		</div>
		${minimalMeadowQuestProgressMarkup(snapshot, 'tracker')}
		<button type="button" class="quest-book-only" data-teaching-placement>Keep guidance in book</button>`;
}

function bodyText(snapshot) {
	if (snapshot.status === 'ready') {
		return 'The three corpses are empty and the eastern road is clear. Return to Reb Mendel with the proof of careful service.';
	}
	if (snapshot.phase === 'recover') {
		return 'The three distinct demons have fallen. Open each required corpse and recover everything before leaving the road.';
	}
	if (snapshot.status === 'active') {
		return 'The Shlichus is yours. Follow the visible road and overcome the Warden, Skirmisher, and Cantor one readable encounter at a time.';
	}
	return snapshot.definition.story?.opening || snapshot.definition.description;
}

function rewardMarkup(reward, label) {
	return `<div class="quest-reward-seal"><span>${label}</span><b>${reward.xp} XP · ${reward.perutas} perutas</b></div>`;
}

function storySection(title, text) {
	return text ? `<div class="quest-story-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>` : '';
}

function actionsMarkup(status) {
	if (status === 'available') return '<button type="button" class="quest-choice quiet" data-decline>Not yet — keep the lantern</button><button type="button" class="quest-choice accept" data-accept>Accept the Shlichus ✨</button>';
	if (status === 'ready') return '<button type="button" class="quest-choice quiet" data-close>Remain in the field</button><button type="button" class="quest-choice accept" data-complete>Return with the light</button>';
	return '<button type="button" class="quest-choice accept" data-close>Continue the journey</button>';
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>'"]/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });
