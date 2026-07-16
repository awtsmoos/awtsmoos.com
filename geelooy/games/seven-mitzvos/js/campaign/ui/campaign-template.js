//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module CampaignTemplate
 * @description
 * Seven provinces receive one accessible shell on Awtsmoos.com. The Awtsmoos
 * creates every path without displacing another; this campaign stands above the
 * preserved shared games while leaving the opening covenant words unobscured.
 */
export function createCampaignTemplate(mount) {
	const heading = h('h2', {
		id: 'campaignTitle',
		text: 'The Seven Provinces'
	});
	const announcement = h('div', {
		className: 'campaignAnnouncement visuallyHidden',
		'aria-live': 'polite',
		'aria-atomic': 'true'
	});
	const controls = h('div', {
		className: 'campaignControls',
		'aria-label': 'Campaign controls'
	});
	const summary = h('div', {
		className: 'campaignSummary'
	});
	const grid = h('div', {
		className: 'campaignProvinceGrid',
		'aria-label': 'Seven Provinces campaign map'
	});
	const next = h('div', {
		className: 'nextRevelationHost'
	});
	const stage = createStageElements();
	const section = h('section', {
		className: 'campaignShell',
		'aria-labelledby': 'campaignTitle'
	}, [
		h('header', { className: 'campaignHeader' }, [
			h('p', { className: 'eyebrow', text: 'Seven Worlds campaign' }),
			heading,
			h('p', {
				className: 'campaignLead',
				text: 'Carry visible choices through Honest Market → Living Sanctuary → Court of Nations → Covenant City.'
			})
		]),
		announcement,
		controls,
		summary,
		grid,
		next,
		stage.section
	]);
	mount.replaceChildren(section);
	return { section, announcement, controls, summary, grid, next, stage };
}

function createStageElements() {
	const close = h('button', {
		className: 'campaignStageClose',
		type: 'button',
		text: 'Back to campaign map',
		'aria-label': 'Exit active campaign stage'
	});
	const title = h('h2', { className: 'campaignStageTitle' });
	const meaning = h('p', { className: 'campaignStageMeaning' });
	const mode = h('span', { className: 'campaignStageMode' });
	const mitzvah = h('span', { className: 'campaignStageMitzvah' });
	const hud = h('div', { className: 'campaignStageHud' });
	const status = h('div', {
		className: 'campaignStageStatus',
		'aria-live': 'polite'
	});
	const body = h('div', { className: 'campaignStageBody' });
	const result = h('div', { className: 'campaignStageResult', hidden: true });
	const section = h('section', { className: 'campaignStage', hidden: true }, [
		h('header', { className: 'campaignStageHeader' }, [close, mitzvah, title, meaning, mode]),
		hud,
		status,
		body,
		result
	]);
	return { section, close, title, meaning, mode, mitzvah, hud, status, body, result };
}
