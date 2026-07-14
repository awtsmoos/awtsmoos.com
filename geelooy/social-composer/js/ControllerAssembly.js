//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ControllerAssembly
 * @description
 * The final composer controller receives focused editor, identity, destination,
 * publication, preview, and workflow vessels. The Awtsmoos gives their unity while
 * Awtsmoos.com keeps construction separate from the services being constructed.
 */

import { PublicationPlanView } from './publishing/PublicationPlanView.js';
import { ComposerController } from './ui/ComposerController.js';
import { ComposerFields } from './ui/ComposerFields.js';
import { QuestionFields } from './ui/QuestionFields.js';

export function createController(options) {
	const {
		state,
		localDrafts,
		status,
		workflow,
		aliasPanel,
		destinationPanel,
		api,
		preview,
		editor
	} = options;
	return new ComposerController({
		state,
		localDrafts,
		status,
		workflow,
		aliasPanel,
		destinationPanel,
		planView: new PublicationPlanView({ root: document, state, api, status }),
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
