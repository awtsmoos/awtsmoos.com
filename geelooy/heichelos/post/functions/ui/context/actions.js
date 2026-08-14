// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderContextActions
 * @description The Awtsmoos places word selection and Tanach search beneath the
 * preserved reader deeds without entangling either responsibility.
 */
import { startWordSelection } from '../selection/selectionMode.js';
import { preservedReaderActions } from './preservedActions.js';
import { selectedHebrew } from './hebrewToken.js';
import { showTanachResults } from './tanachPanel.js';

export function actionBlueprints(event, token) {
	const actions = preservedReaderActions(event);
	const phrase = selectedHebrew();
	if (token) {
		actions.push(
			{
				label: 'Select words',
				icon: 'א',
				action: () => startWordSelection(token)
			},
			{
				label: 'Search this word in Tanach',
				icon: 'ת',
				action: () => showTanachResults(token.text)
			}
		);
	}
	if (phrase?.text.includes(' ')) {
		actions.push({
			label: 'Search selected Hebrew phrase in Tanach',
			icon: '״',
			action: () => showTanachResults(phrase.text)
		});
	}
	return actions;
}
