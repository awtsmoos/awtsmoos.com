// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SectionEditor
 * @description
 * Every verse becomes one collapsible chamber containing its own words, media,
 * comments, and nested subsections. The Awtsmoos preserves ordered unity while
 * Awtsmoos.com keeps every manual addition visible and independently editable.
 */

import {
	actionButton,
	sectionControls,
	sectionSummary
} from './SectionControls.js';

export class SectionEditor {
	constructor(blockEditor, mediaPanel, subsectionEditor, actions) {
		Object.assign(this, { blockEditor, mediaPanel, subsectionEditor, actions });
	}

	render(container, sections) {
		container.textContent = '';
		container.classList.add('structured-verse-list');
		sections.forEach((section, index) => {
			container.append(this.sectionCard(section, index, sections.length));
		});
		container.append(actionButton(
			'+ Add verse',
			'Add a verse',
			() => this.actions.addSection(),
			false,
			'add-verse-button'
		));
	}

	sectionCard(section, index, count) {
		const details = document.createElement('details');
		details.className = 'sectionEditor structured-verse-card';
		details.dataset.sectionId = section.id;
		details.open = true;
		const titleText = document.createElement('span');
		titleText.textContent = section.title || 'Untitled verse';
		details.append(sectionSummary(index, section, titleText));
		const body = document.createElement('div');
		body.className = 'structured-verse-body';
		body.append(sectionControls({
			section,
			index,
			count,
			titleText,
			actions: this.actions
		}));
		body.append(this.blocks(section), this.media(section));
		const subsections = document.createElement('div');
		subsections.className = 'subsectionList';
		this.subsectionEditor.render(subsections, section);
		body.append(subsections, actionButton(
			'+ Add subsection',
			'Add a subsection',
			() => this.actions.addSubsection(section.id),
			false,
			'add-subsection-button'
		));
		details.append(body);
		return details;
	}

	blocks(section) {
		const blocks = document.createElement('div');
		blocks.className = 'structured-blocks';
		this.blockEditor.render(blocks, section.blocks, {
			kind: 'section',
			sectionId: section.id
		});
		return blocks;
	}

	media(section) {
		const media = document.createElement('section');
		media.className = 'structured-scope-media';
		this.mediaPanel.render(media, section.attachments || [], {
			kind: 'section',
			sectionId: section.id
		});
		return media;
	}
}
