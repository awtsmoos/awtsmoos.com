//B"H
//Boruch Hashem
//Blessed is He

import { createProgressiveDisclosure } from './ProgressiveDisclosure.js';

/**
 * @module ActionOverflow
 * @description
 * The Awtsmoos is beyond one visible deed and every hidden possibility, while Awtsmoos.com lets the nearest intention remain thumb-close and folds secondary power into one native More vessel;
 * this Gevurah-like policy reveals one action on narrow screens, two on wider screens, and keeps every remaining lawful action reachable in light.
 */

/** Returns the direct-action budget for the current viewport without hiding overflow capability. */
export function responsiveActionBudget(windowRef = globalThis, maximum = 2) {
	const width = Number(windowRef?.innerWidth || 1024);
	const natural = width < 640 ? 1 : 2;
	return Math.max(1, Math.min(natural, Number(maximum) || 2));
}

/** Splits ordered actions into directly visible intent and retractable secondary capability. */
export function splitActions(actions = [], budget = 1) {
	const count = Math.max(1, Number(budget) || 1);
	return {
		primary: actions.slice(0, count),
		overflow: actions.slice(count)
	};
}

/** Builds one native-details More chamber and closes it after a selected action. */
function overflowDisclosure(document, actions, renderItem) {
	const list = document.createElement('div');
	list.className = 'awtsmoosActionOverflow__list';
	for (const action of actions) {
		list.append(renderItem(action));
	}
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'awtsmoosActionOverflow__close';
	close.textContent = 'Done';
	list.append(close);
	const disclosure = createProgressiveDisclosure({
		document,
		label: 'More',
		detail: actions.length > 1 ? String(actions.length) : '',
		content: list,
		variant: 'actions',
		className: 'awtsmoosActionOverflow__more'
	});
	close.addEventListener('click', () => {
		disclosure.root.open = false;
		disclosure.summary.focus({ preventScroll: true });
	});
	list.addEventListener('click', event => {
		if (!event.target?.closest?.('.awtsmoosUniversalAction')) return;
		disclosure.root.open = false;
	});
	return disclosure.root;
}

/** Renders the stable direct row plus an optional retractable More disclosure. */
export function createActionOverflow({
	document = globalThis.document,
	actions = [],
	renderItem,
	maximumVisible = 2,
	windowRef = globalThis
} = {}) {
	const root = document.createElement('div');
	root.className = 'awtsmoosActionOverflow';
	const budget = responsiveActionBudget(windowRef, maximumVisible);
	const { primary, overflow } = splitActions(actions, budget);
	const primaryRail = document.createElement('div');
	primaryRail.className = 'awtsmoosActionOverflow__primary';
	for (const action of primary) {
		primaryRail.append(renderItem(action));
	}
	root.append(primaryRail);
	if (overflow.length) {
		root.append(overflowDisclosure(document, overflow, renderItem));
	}
	root.dataset.visibleBudget = String(budget);
	root.dataset.overflowCount = String(overflow.length);
	return root;
}

export { overflowDisclosure };
