//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ComposerAssembly
 * @description The Awtsmoos gathers creator intent, draft memory, editing, identity, destination, and publication without confusion;
 * Awtsmoos.com builds each service once and versions the resilient editor vessel so no stale upload path grows beneath creation.
 */
import { SocialComposerApi } from './api/SocialComposerApi.js';
import { createController } from './ControllerAssembly.js';
import { createCreatorAssembly } from './CreatorAssembly.js';
import { createDestinationAssembly } from './DestinationAssembly.js';
import { createDraftAssembly } from './DraftAssembly.js';
import { createEditorAssembly } from './EditorAssembly.js?v=resilience-002';
import { AliasMemory } from './identity/AliasMemory.js';
import { AliasPanel } from './identity/AliasPanel.js';
import { PublicationPlanView } from './publishing/PublicationPlanView.js';
import { createReelAssembly } from './ReelAssembly.js';
import { PostPreview } from './render/PostPreview.js';
import { createReviewAssembly } from './ReviewAssembly.js';
import { ComposerState } from './state/ComposerState.js';
import { LocalDraftRepository } from './state/LocalDraftRepository.js';
import { ComposerWorkflow } from './ui/ComposerWorkflow.js';
import { StatusView } from './ui/StatusView.js';

function createWorkflow({ state, localDrafts, api, status, context, draftHistory }) {
	return new ComposerWorkflow({
		state,
		localDrafts,
		draftHistory,
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
	const drafts = createDraftAssembly({ state, localDrafts, status });
	const creator = createCreatorAssembly({ state, editor, status });
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
	const planView = new PublicationPlanView({ root: document, state, api, status });
	const workflow = createWorkflow({ state, localDrafts, api, status, context, draftHistory: drafts.history });
	const review = createReviewAssembly({ state, workflow, planView, status });
	const controller = createController({
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
	});
	return {
		aliasPanel,
		api,
		controller,
		creator,
		destinationPanel,
		drafts,
		planView,
		reel,
		review,
		state,
		status,
		workflow
	};
}

export { createWorkflow };
