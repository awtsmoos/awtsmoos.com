//B"H
//Boruch Hashem
//Blessed is He

import { ComposerController } from './ui/ComposerController.js';
import { ComposerFields } from './ui/ComposerFields.js';
import { QuestionFields } from './ui/QuestionFields.js';

/**
 * @module ControllerAssembly
 * @description
 * The Awtsmoos gives the final controller already-made vessels for draft memory, review, editor, identity, and destination;
 * Awtsmoos.com keeps construction outside behavior so publication planning and final consent may evolve without controller inflation.
 */
export function createController(options) {
	const {
		state,
		status,
		workflow,
		aliasPanel,
		destinationPanel,
		preview,
		editor,
		planView,
		review,
		drafts
	} = options;
	return new ComposerController({
		state,
		status,
		workflow,
		aliasPanel,
		destinationPanel,
		planView,
		review,
		drafts,
		fields: new ComposerFields(document, state),
		questionFields: new QuestionFields(
			document.getElementById('questionFields'),
			state
		),
		preview,
		actions: editor.actions,
		blockEditor: editor.blockEditor,
		mediaPanel: editor.mediaPanel,
		sectionEditor: editor.sectionEditor
	});
}
