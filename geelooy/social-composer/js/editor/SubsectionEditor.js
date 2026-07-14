//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SubsectionEditor
 * @description
 * One verse may open into smaller addressed chambers. Awtsmoos.com gives each
 * subsection its own blocks, media, and stable discussion coordinate without
 * permitting recursive palaces that obscure the simple light of the Awtsmoos.
 */

export class SubsectionEditor {
	constructor(blockEditor, mediaPanel, actions) {
		this.blockEditor = blockEditor;
		this.mediaPanel = mediaPanel;
		this.actions = actions;
	}

	render(container, section) {
		container.textContent = '';
		for (const subsection of section.subsections || []) {
			container.append(this.card(section, subsection));
		}
		const add = document.createElement('button');
		add.type = 'button';
		add.className = 'secondaryAction';
		add.textContent = '+ Add subsection';
		add.addEventListener('click', () => this.actions.addSubsection(section.id));
		container.append(add);
	}

	card(section, subsection) {
		const article = document.createElement('article');
		article.className = 'subsectionEditor';
		const header = document.createElement('div');
		header.className = 'sectionHeader';
		const title = document.createElement('input');
		title.value = subsection.title;
		title.placeholder = 'Subsection title';
		title.setAttribute('aria-label', 'Subsection title');
		title.addEventListener('input', () => {
			this.actions.setSubsectionTitle(section.id, subsection.id, title.value);
		});
		const coordinate = document.createElement('code');
		coordinate.textContent = `${section.id} / ${subsection.id}`;
		const remove = document.createElement('button');
		remove.type = 'button';
		remove.textContent = 'Remove subsection';
		remove.addEventListener('click', () => {
			this.actions.removeSubsection(section.id, subsection.id);
		});
		header.append(title, coordinate, remove);
		const blocks = document.createElement('div');
		const scope = {
			kind: 'subsection',
			sectionId: section.id,
			subsectionId: subsection.id
		};
		this.blockEditor.render(blocks, subsection.blocks, scope);
		const media = document.createElement('div');
		this.mediaPanel.render(media, subsection.attachments || [], scope);
		article.append(header, blocks, media);
		return article;
	}
}
