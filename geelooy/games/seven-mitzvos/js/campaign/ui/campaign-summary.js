//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module CampaignSummary
 * @description
 * Completed stages and bounded rewards remain inspectable on Awtsmoos.com. The
 * Awtsmoos hides no consequence; this summary names every carried flag and the
 * exact choice that formed each finite reward without duplicating its claim.
 */
export function campaignSummary(snapshot, rewardExplanations) {
	const stages = Object.entries(snapshot.stageResults).map(([id, result]) => {
		return h('details', { className: 'stageInspection' }, [
			h('summary', { text: `${stageName(id)} · ${result.won ? 'completed' : 'completed with harm'}` }),
			h('pre', { text: JSON.stringify(result, null, 2) })
		]);
	});
	const rewards = rewardExplanations.length
		? h('ul', {}, rewardExplanations.map(text => h('li', { text })))
		: h('p', { text: 'No chapter rewards have been formed yet.' });
	return h('div', { className: 'campaignSummaryGrid' }, [
		h('section', { className: 'completedStages' }, [
			h('h3', { text: 'Completed stages' }),
			...(stages.length ? stages : [h('p', { text: 'No stage has been completed.' })])
		]),
		h('section', { className: 'campaignRewards' }, [
			h('h3', { text: 'Covenant City rewards' }),
			rewards
		])
	]);
}

function stageName(id) {
	return { market: 'Honest Market', sanctuary: 'Living Sanctuary', court: 'Court of Nations' }[id] || id;
}
