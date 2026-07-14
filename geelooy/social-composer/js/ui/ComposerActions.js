//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ComposerActions
 * @description
 * Every button enters state through named mutations: block, verse, subsection,
 * media, and upload. Awtsmoos.com keeps action paths explicit so the living
 * editor never hides accidental state inside the changing garment of the DOM.
 */
import { createBlock, createSection, createSubsection } from '../model/Ids.js';
export class ComposerActions {
	constructor(state, attachmentStore, uploader, status) {
		this.state = state;
		this.attachmentStore = attachmentStore;
		this.uploader = uploader;
		this.status = status;
	}
	block = (action, payload) => {
		this.state.mutate(`block:${action}`, snapshot => {
			const blocks = resolveBlocks(snapshot, payload.scope);
			const index = blocks.findIndex(block => block.id === payload.blockId);
			if (action === 'add') blocks.push(createBlock());
			if (action === 'text' && index >= 0) blocks[index].text = payload.value;
			if (action === 'type' && index >= 0) blocks[index].type = payload.value;
			if (action === 'remove' && index >= 0 && blocks.length > 1) blocks.splice(index, 1);
			if (action === 'move' && index >= 0) move(blocks, index, index + payload.direction);
		});
	};
	addSection = () => {
		this.state.mutate('section:add', snapshot => snapshot.sections.push(createSection()));
	};
	setSectionTitle = (sectionId, title) => {
		this.state.mutate('section:title', snapshot => {
			const section = snapshot.sections.find(item => item.id === sectionId);
			if (section) section.title = title;
		});
	};
	setSectionComments = (sectionId, enabled) => {
		this.state.mutate('section:comments', snapshot => {
			const section = snapshot.sections.find(item => item.id === sectionId);
			if (section) section.commentsEnabled = enabled;
		});
	};
	removeSection = sectionId => {
		this.state.mutate('section:remove', snapshot => {
			const index = snapshot.sections.findIndex(item => item.id === sectionId);
			if (index >= 0) snapshot.sections.splice(index, 1);
		});
	};
	moveSection = (sectionId, direction) => {
		this.state.mutate('section:move', snapshot => {
			const index = snapshot.sections.findIndex(item => item.id === sectionId);
			move(snapshot.sections, index, index + direction);
		});
	};
	addSubsection = sectionId => {
		this.state.mutate('subsection:add', snapshot => {
			const section = snapshot.sections.find(item => item.id === sectionId);
			section?.subsections.push({ ...createSubsection(), attachments: [] });
		});
	};
	setSubsectionTitle = (sectionId, subsectionId, title) => {
		this.state.mutate('subsection:title', snapshot => {
			const subsection = findSubsection(snapshot, sectionId, subsectionId);
			if (subsection) subsection.title = title;
		});
	};
	removeSubsection = (sectionId, subsectionId) => {
		this.state.mutate('subsection:remove', snapshot => {
			const section = snapshot.sections.find(item => item.id === sectionId);
			const index = section?.subsections.findIndex(item => item.id === subsectionId) ?? -1;
			if (index >= 0) section.subsections.splice(index, 1);
		});
	};
	mediaActions() {
		return {
			add: (scope, files) => this.attachmentStore.addFiles(scope, files),
			update: (scope, id, changes) => this.attachmentStore.update(scope, id, changes),
			remove: (scope, id) => this.attachmentStore.remove(scope, id),
			upload: async (scope, attachment) => {
				this.status.show('Uploading media…', 'working');
				try {
					await this.uploader.upload(scope, attachment, this.state.snapshot().identity);
					this.status.show('Media uploaded.', 'success');
				} catch (error) {
					this.status.show(error.message, 'error');
				}
			}
		};
	}
}
function resolveBlocks(snapshot, scope) {
	if (scope.kind === 'root') return snapshot.rootBlocks;
	const section = snapshot.sections.find(item => item.id === scope.sectionId);
	if (scope.kind === 'section') return section.blocks;
	return section.subsections.find(item => item.id === scope.subsectionId).blocks;
}
function findSubsection(snapshot, sectionId, subsectionId) {
	return snapshot.sections
		.find(item => item.id === sectionId)
		?.subsections.find(item => item.id === subsectionId);
}
function move(items, from, to) {
	if (from < 0 || to < 0 || to >= items.length) return;
	const [item] = items.splice(from, 1);
	items.splice(to, 0, item);
}
