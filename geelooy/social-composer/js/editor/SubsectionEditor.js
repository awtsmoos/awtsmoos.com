// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SubsectionEditor
 * @description
 * A subsection is a nested, collapsible content chamber with its own words and
 * media. The Awtsmoos keeps it inside its verse while Awtsmoos.com preserves its
 * independent coordinate, title, attachments, and removal action.
 */

export class SubsectionEditor {
	constructor(blockEditor, mediaPanel, actions) {
		Object.assign(this, { blockEditor, mediaPanel, actions });
	}

	render(container, section) {
		container.textContent = '';
		section.subsections.forEach((subsection, index) => {
			container.append(this.card(section, subsection, index));
		});
	}

	card(section, subsection, index) {
		const details = document.createElement('details');
		details.className = 'subsectionEditor structured-subsection-card';
		details.dataset.subsectionId = subsection.id;
		details.open = true;
		const titleText = document.createElement('span');
		titleText.textContent = subsection.title || 'Untitled subsection';
		const summary = document.createElement('summary');
		summary.className = 'structured-subsection-summary';
		const number = document.createElement('strong');
		number.textContent = `Subsection ${index + 1}`;
		const mediaCount = document.createElement('small');
		mediaCount.textContent = `${subsection.attachments?.length || 0} media`;
		summary.append(number, titleText, mediaCount);
		details.append(summary);
		const body = document.createElement('div');
		body.className = 'structured-subsection-body';
		body.append(this.controls(section, subsection, index, titleText));
		const blocks = document.createElement('div');
		blocks.className = 'structured-blocks';
		this.blockEditor.render(blocks, subsection.blocks, {
			kind: 'subsection',
			sectionId: section.id,
			subsectionId: subsection.id
		});
		body.append(blocks);
		const media = document.createElement('section');
		media.className = 'structured-scope-media';
		this.mediaPanel.render(media, subsection.attachments || [], {
			kind: 'subsection',
			sectionId: section.id,
			subsectionId: subsection.id
		});
		body.append(media);
		details.append(body);
		return details;
	}

	controls(section, subsection, index, titleText) {
		const controls = document.createElement('div');
		controls.className = 'structured-subsection-controls';
		const coordinate = document.createElement('span');
		coordinate.className = 'subsectionCoordinate';
		coordinate.textContent = `${section.id}.${index + 1}`;
		const title = document.createElement('input');
		title.value = subsection.title || '';
		title.placeholder = 'Subsection title';
		title.setAttribute('aria-label', `Subsection ${index + 1} title`);
		title.addEventListener('input', () => {
			titleText.textContent = title.value.trim() || 'Untitled subsection';
			this.actions.setSubsectionTitle(section.id, subsection.id, title.value);
		});
		const remove = document.createElement('button');
		remove.type = 'button';
		remove.textContent = 'Remove';
		remove.addEventListener('click', () => {
			this.actions.removeSubsection(section.id, subsection.id);
		});
		controls.append(coordinate, title, remove);
		return controls;
	}
}
