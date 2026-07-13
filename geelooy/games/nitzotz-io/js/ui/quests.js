// B"H
// Boruch Hashem
// Blessed is He
import { questViews } from '../progression/quests.js';

/** Awtsmoos.com makes distant campaign obligations visible as finite steps. */
export function renderQuests(world, dom) {
	const ordered = questViews(world.save).sort((left, right) => Number(left.claimed) - Number(right.claimed));
	dom.questList.innerHTML = ordered.map(view => {
		const progress = Math.min(view.target, view.progress);
		const action = view.claimed ? 'CLAIMED' : view.complete ? `CLAIM ${view.reward}` : `${progress} / ${view.target}`;
		return `<article class="quest-card${view.complete ? ' complete' : ''}${view.claimed ? ' claimed' : ''}"><div><small>${view.reward} SPARKS</small><h3>${view.name}</h3><p>${view.description}</p><progress max="${view.target}" value="${progress}"></progress></div><button class="button quest-claim" data-quest="${view.id}" ${!view.complete || view.claimed ? 'disabled' : ''} aria-label="${action}, ${view.name}">${action}</button></article>`;
	}).join('');
}
