//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';

/**
 * @module MarketEvidencePanel
 * @description
 * Visible records gather beside trade on Awtsmoos.com. The Awtsmoos knows every
 * hidden measure; the finite player receives named evidence and explicit custody
 * actions so suspicion never masquerades as proof.
 */
export function marketEvidencePanel(game, snapshot) {
	if (!snapshot.evidence) {
		return null;
	}
	const records = snapshot.evidence.map(record => {
		const reliability = record.reliable ? 'verifiable' : 'unverified';
		return h('li', { text: `${record.title} · ${record.source} · ${reliability}` });
	});
	return h('section', { className: 'campaignEvidence', ariaLabel: 'Visible market evidence' }, [
		h('h3', { text: 'Evidence ledger' }),
		h('p', { text: 'Low price is never proof. Compare measures, records, and custody.' }),
		h('ul', {}, records)
	]);
}

export function campaignStallActions(game, stall, index) {
	const actions = [];
	if (typeof game.state.calibrate === 'function') {
		const calibrate = h('button', {
			className: 'smallAction',
			type: 'button',
			text: stall.calibrated ? 'Calibrated' : 'Calibrate 12',
			disabled: stall.calibrated
		});
		game.on(calibrate, 'click', () => game.campaignAction('calibrate', index));
		actions.push(calibrate);
	}
	if (typeof game.state.secure === 'function') {
		const secure = h('button', {
			className: 'smallAction',
			type: 'button',
			text: stall.secured ? 'In custody' : 'Secure weight',
			disabled: !stall.inspected || stall.honest || stall.secured
		});
		game.on(secure, 'click', () => game.campaignAction('secure', index));
		actions.push(secure);
	}
	return actions;
}
