//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ComposerAssembly
 * @description
 * Focused services are assembled without hiding their contracts inside startup.
 * The Awtsmoos gives their unity; Awtsmoos.com keeps identity, destination, rich
 * editing, media, preview, drafts, and publication independently inspectable.
 */
import { SocialComposerApi } from './api/SocialComposerApi.js';
import { createController } from './ControllerAssembly.js';
import { DestinationCreation } from './destination/DestinationCreation.js';
import { DestinationPanel } from './destination/DestinationPanel.js';
import { SecondaryPlacementPanel } from './destination/SecondaryPlacementPanel.js';
import { BlockEditor } from './editor/BlockEditor.js';
import { SectionEditor } from './editor/SectionEditor.js';
import { SubsectionEditor } from './editor/SubsectionEditor.js';
import { AliasMemory } from './identity/AliasMemory.js';
import { AliasPanel } from './identity/AliasPanel.js';
import { AttachmentStore } from './media/AttachmentStore.js';
import { MediaPanel } from './media/MediaPanel.js';
import { MediaUploader } from './media/MediaUploader.js';
import { PostPreview } from './render/PostPreview.js';
import { ComposerState } from './state/ComposerState.js';
import { LocalDraftRepository } from './state/LocalDraftRepository.js';
import { ComposerActions } from './ui/ComposerActions.js';
import { ComposerWorkflow } from './ui/ComposerWorkflow.js';
import { StatusView } from './ui/StatusView.js';
function editorAssembly(state, status) {
	const attachments = new AttachmentStore(state);
	const uploader = new MediaUploader(attachments);
	const actions = new ComposerActions(state, attachments, uploader, status);
	const mediaPanel = new MediaPanel(actions.mediaActions());
	const blockEditor = new BlockEditor(actions.block);
	const subsectionEditor = new SubsectionEditor(blockEditor, mediaPanel, actions);
	return {
		actions,
		mediaPanel,
		blockEditor,
		sectionEditor: new SectionEditor(
			blockEditor,
			mediaPanel,
			subsectionEditor,
			actions
		)
	};
}
function destinationAssembly({ state, api, status }) {
	const secondaryPanel = new SecondaryPlacementPanel({ root: document, state });
	let panel;
	const creation = new DestinationCreation({
		root: document,
		state,
		api,
		status,
		onCreated: detail => panel.open(detail)
	});
	panel = new DestinationPanel({
		root: document,
		state,
		api,
		status,
		creation,
		secondaryPanel
	});
	return panel;
}
function workflowAssembly({ state, localDrafts, api, status, context }) {
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
	const editor = editorAssembly(state, status);
	const destinationPanel = destinationAssembly({ state, api, status });
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
	const workflow = workflowAssembly({ state, localDrafts, api, status, context });
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
	return { state, controller, workflow, destinationPanel, aliasPanel };
}
export {
	editorAssembly,
	destinationAssembly,
	workflowAssembly
};
