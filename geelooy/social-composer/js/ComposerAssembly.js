// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerAssembly
 * @description
 * Focused services assemble without hiding their contracts inside startup. The
 * Awtsmoos gives unity while Awtsmoos.com keeps identity, playlists, editing,
 * reels, preview, drafts, and publication independently inspectable.
 */

import { SocialComposerApi } from './api/SocialComposerApi.js';
import { createController } from './ControllerAssembly.js';
import { createDestinationAssembly } from './DestinationAssembly.js';
import { createEditorAssembly } from './EditorAssembly.js';
import { AliasMemory } from './identity/AliasMemory.js';
import { AliasPanel } from './identity/AliasPanel.js';
import { createReelAssembly } from './ReelAssembly.js';
import { PostPreview } from './render/PostPreview.js';
import { ComposerState } from './state/ComposerState.js';
import { LocalDraftRepository } from './state/LocalDraftRepository.js';
import { ComposerWorkflow } from './ui/ComposerWorkflow.js';
import { StatusView } from './ui/StatusView.js';

function createWorkflow({ state, localDrafts, api, status, context }) {
	return new ComposerWorkflow({
		state,
		localDrafts,
		api,
		status,
		returnPath: context.returnPath,
		onPublished: result => {
			document.getElementById('publishResult').textContent = JSON.stringify(result, null, 2);
		}
	});
}

export function createComposer(context) {
	const state = new ComposerState(context);
	const localDrafts = new LocalDraftRepository();
	const api = new SocialComposerApi();
	const status = new StatusView(document.getElementById('statusMessage'));
	const editor = createEditorAssembly(state, status);
	const destinationPanel = createDestinationAssembly({ state, api, status });
	const reel = createReelAssembly({ editor, status });
	const aliasPanel = new AliasPanel({
		root: document,
		state,
		api,
		status,
		memory: new AliasMemory(),
		onAliasChanged: aliasId => void destinationPanel.load(aliasId)
	});
	const preview = new PostPreview(
		document.getElementById('postPreview'),
		document.getElementById('payloadInspector')
	);
	const workflow = createWorkflow({ state, localDrafts, api, status, context });
	const controller = createController({
		state,
		localDrafts,
		status,
		workflow,
		aliasPanel,
		destinationPanel,
		api,
		preview,
		editor
	});
	return {
		aliasPanel,
		controller,
		destinationPanel,
		reel,
		state,
		workflow
	};
}

export {
	createWorkflow
};
