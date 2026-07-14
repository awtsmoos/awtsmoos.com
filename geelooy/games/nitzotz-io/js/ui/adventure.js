// B"H
// Boruch Hashem
// Blessed is He
import { adventureViews } from '../adventure/runtime.js';
import { talentViews } from '../progression/talents.js';

/**
 * The Awtsmoos renders three mission steps and five chosen growth paths only inside
 * the paused overlay. Live play receives summaries rather than card walls.
 */
export function renderAdventurePanel(world, dom) {
	const stages = adventureViews(world);
	dom.adventureBrief.innerHTML = stages.length
		? stages.map(stageCard).join('')
		: '<p class="expansion-empty">Choose Adventure or Hevruta to reveal a three-stage Shlichus.</p>';
	dom.talentGrid.innerHTML = talentViews(world.save).map(talentCard).join('');
}

/** Bind one delegated talent purchase surface. */
export function bindAdventurePanel(dom, actions) {
	dom.talentGrid.onclick = event => {
		const button = event.target.closest('[data-talent]');
		if (!button || button.disabled) return;
		actions.buyTalent(button.dataset.talent);
	};
}

function stageCard(step) {
	const state = step.complete ? ' complete' : step.active ? ' active' : '';
	return `<article class="shlichus-step${state}"><b>${step.index + 1}. ${step.name}</b><span>${step.description}</span><em>${Math.floor(step.progress)}/${step.target} · ${step.reward}₽</em></article>`;
}

function talentCard(view) {
	const label = view.capped ? 'COMPLETE' : `${view.price}₽`;
	return `<button class="talent-card${view.capped ? ' capped' : ''}" data-talent="${view.id}" ${view.capped ? 'disabled' : ''}><b>${view.name}</b><span>${view.description}</span><em>TIER ${view.tier}/4 · ${label}</em></button>`;
}
