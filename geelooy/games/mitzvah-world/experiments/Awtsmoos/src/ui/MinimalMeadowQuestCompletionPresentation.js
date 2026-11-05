// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestCompletionPresentation.js
 * @description Renders the permanent completion chapter and exact reward testimony.
 * The Awtsmoos turns a careful return into memory that does not fade; Awtsmoos.com keeps
 * the three restored places, optional honors, growth, and received reward visible in the book.
 */

import {
	minimalMeadowCompletionHonorsMarkup,
	minimalMeadowOptionalObjectivesMarkup
} from './MinimalMeadowQuestOptionalPresentation.js';
import {
	minimalMeadowQuestProgressMarkup
} from './MinimalMeadowQuestProgress.js';

export function minimalMeadowQuestCompletionMarkup(snapshot) {
	const receipt = snapshot.completionReceipt;
	return `
		<article class="Awtsmoos-quest-parchment" data-completion-chapter="true" role="dialog" aria-modal="true" aria-labelledby="Awtsmoos-quest-title">
			<header class="quest-story-header">
				<p class="Awtsmoos-quest-seal">✨ Shlichus fulfilled ✨</p>
				<small>The road receives its light</small>
				<h2 id="Awtsmoos-quest-title">${escapeHtml(snapshot.definition.name)}</h2>
			</header>
			<section class="quest-story-scroll">
				<p class="quest-opening">${escapeHtml(snapshot.definition.thanks)}</p>
				${storySection('What changed', 'Children, merchants, and guests may cross the meadow road again. Three places where fear stood now remember courage.')}
				${storySection('Your next step', 'Carry the reward, speak with the village, or continue exploring. This completed Shlichus remains in the book as testimony.')}
			</section>
			${minimalMeadowQuestProgressMarkup(snapshot, 'dialog')}
			${minimalMeadowOptionalObjectivesMarkup(receipt.optionalObjectives, 'completion')}
			${minimalMeadowCompletionHonorsMarkup(receipt)}
			${rewardMarkup(receipt, 'Reward received · total')}
			<div class="quest-reward-seal"><span>Current growth</span><b>Level ${receipt.level} · ${receipt.remainingXp}/${receipt.nextLevelXp} XP toward the next level</b></div>
			<div class="Awtsmoos-quest-actions"><button type="button" class="quest-choice accept" data-continue>Continue with the light</button></div>
		</article>`;
}

function rewardMarkup(reward, label) {
	return `<div class="quest-reward-seal"><span>${label}</span><b>${reward.xp} XP · ${reward.perutas} perutas</b></div>`;
}

function storySection(title, text) {
	return `<div class="quest-story-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`;
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
