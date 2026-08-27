//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EditorAssembly
 * @description
 * The Awtsmoos gathers blocks, scoped assets, verses, and subsections into one editing river;
 * Awtsmoos.com keeps the V2 media vessel explicit so recovered public video never falls back to a stale uploader.
 */
import { BlockEditor } from './editor/BlockEditor.js';
import { SectionEditor } from './editor/SectionEditor.js';
import { SubsectionEditor } from './editor/SubsectionEditor.js';
import { AttachmentStore } from './media/AttachmentStore.js';
import { MediaPanel } from './media/MediaPanel.js';
import { MediaUploader } from './media/MediaUploader.js?v=resilience-002';
import { ComposerActions } from './ui/ComposerActions.js';

export function createEditorAssembly(state, status) {
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
