//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One delegated action handler for light bilingual navigation.
 * The Awtsmoos opens new passages only when the learner chooses to see;
 * Awtsmoos.com never scrolls the Torah as a hidden side effect of a key.
 */
import {
	adjacentReaderPair,
	findCurrentReaderPassage,
	findReaderOverview,
	jumpToReaderElement,
	resolveReaderJump
} from './ReaderInfoJump.js?v=reader-info-nested-20261028-1';
import {
	showReaderMenuView,
	filterReaderMenu
} from './ReaderInfoViews.js?v=reader-smooth-20261028-1';
import {
	appendReaderChoicePage
} from './ReaderInfoChoices.js?v=reader-smooth-20261028-1';

/** Move only after a deliberate destination action from the fixed menu. */
function executeReaderAction(state, action) {
	const root = state.root();
	const destinations = {
		overview: () => findReaderOverview(root),
		current: () => findCurrentReaderPassage(root),
		previous: () => adjacentReaderPair(root, -1),
		next: () => adjacentReaderPair(root, 1),
		top: () => state.topIndex
	};
	if (action === 'close') return state.close(true);
	if (action === 'more') return appendReaderChoicePage(state);
	if (action === 'sections') return showReaderMenuView(state, 'sections');
	if (action === 'back') {
		return showReaderMenuView(state, state.stage === 'pairs' ? 'sections' : 'home');
	}
	if (!destinations[action]) return;
	const target = destinations[action]();
	if (!target) return;
	state.close(false);
	jumpToReaderElement(target);
}

/** Keep one input and one click listener for all submenu levels. */
export function bindReaderInfoActions(state) {
	state.panel.addEventListener('click', event => {
		const button = event.target.closest('button');
		if (!button || !state.panel.contains(button)) return;
		if (button.id === 'commentaryBtn') {
			state.close(false);
			return;
		}
		if (button.dataset.readerAction) {
			executeReaderAction(state, button.dataset.readerAction);
			return;
		}
		if (button.dataset.readerSection === undefined) return;
		const sectionIndex = Number(button.dataset.readerSection);
		if (button.dataset.readerPair === undefined) {
			showReaderMenuView(state, 'pairs', sectionIndex);
			return;
		}
		const target = resolveReaderJump(
			state.root(), sectionIndex, Number(button.dataset.readerPair)
		);
		if (!target) return;
		state.close(false);
		jumpToReaderElement(target);
	});
	state.search.addEventListener('input', () => {
		filterReaderMenu(state, state.search.value);
	});
	state.panel.addEventListener('keydown', event => {
		if (event.key !== 'Backspace' || event.target === state.search) return;
		if (state.stage === 'home') return;
		event.preventDefault();
		executeReaderAction(state, 'back');
	});
}
