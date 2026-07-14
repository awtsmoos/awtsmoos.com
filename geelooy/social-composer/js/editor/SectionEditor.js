//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SectionEditor
 * @description
 * Ordered verses receive titles, stable IDs, rich blocks, media, comments, and
 * one layer of subsections. Awtsmoos.com can host discussion at the precise place
 * of meaning while each verse remains a clear vessel beneath the Awtsmoos.
 */

export class SectionEditor {
	constructor(blockEditor, mediaPanel, subsectionEditor, actions) {
		this.blockEditor = blockEditor;
		this.mediaPanel = mediaPanel;
		this.subsectionEditor = subsectionEditor;
		this.actions = actions;
	}

	render(container, sections) {
		container.textContent = '';
		sections.forEach((section, index) => {
			container.append(this.card(section, index, sections.length));
		});
		const add = document.createElement('button');
		add.type = 'button';
		add.id = 'addSectionButton';
		add.className = 'primaryAction';
		add.textContent = '+ Add verse or section';
		add.addEventListener('click', () => this.actions.addSection());
		container.append(add);
	}

	card(section, index, count) {
		const article = document.createElement('article');
		article.className = 'sectionEditor';
		article.dataset.sectionId = section.id;
		article.append(this.header(section, index, count));
		const coordinate = document.createElement('p');
		coordinate.className = 'coordinate';
		coordinate.textContent = `Verse discussion coordinate: ${section.id}`;
		const blocks = document.createElement('div');
		const scope = { kind: 'section', sectionId: section.id };
		this.blockEditor.render(blocks, section.blocks, scope);
		const media = document.createElement('div');
		this.mediaPanel.render(media, section.attachments || [], scope);
		const subsections = document.createElement('div');
		subsections.className = 'subsectionList';
		this.subsectionEditor.render(subsections, section);
		article.append(coordinate, blocks, media, subsections);
		return article;
	}

	header(section, index, count) {
		const header = document.createElement('div');
		header.className = 'sectionHeader';
		const title = document.createElement('input');
		title.value = section.title;
		title.placeholder = 'Verse or section title';
		title.setAttribute('aria-label', 'Verse title');
		title.addEventListener('input', () => {
			this.actions.setSectionTitle(section.id, title.value);
		});
		const comments = document.createElement('label');
		comments.className = 'toggleLabel';
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = section.commentsEnabled !== false;
		checkbox.addEventListener('change', () => {
			this.actions.setSectionComments(section.id, checkbox.checked);
		});
		comments.append(checkbox, document.createTextNode(' Verse comments'));
		header.append(
			title,
			comments,
			this.button('↑', () => this.actions.moveSection(section.id, -1), index === 0),
			this.button('↓', () => this.actions.moveSection(section.id, 1), index === count - 1),
			this.button('Remove', () => this.actions.removeSection(section.id))
		);
		return header;
	}

	button(text, action, disabled = false) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = text;
		button.disabled = disabled;
		button.addEventListener('click', action);
		return button;
	}
}
