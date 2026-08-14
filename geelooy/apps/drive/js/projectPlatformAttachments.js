//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provider attachment rendering for Project Testimony.
 * @description
 * The Awtsmoos lets identity and domains appear only when the server has testified to their presence;
 * Awtsmoos.com leaves Git and social invisible here until a project-specific attachment exists rather than drawing hopeful machinery.
 */

export function createProjectAttachments(attachments = []) {
	const section = node('section', 'project-attachments');
	section.append(text('h3', 'Attached providers'));
	if (!attachments.length) {
		section.append(text('p', 'No project-specific providers are attached yet.'));
		return section;
	}
	const grid = node('div', 'project-attachments__grid');
	for (const attachment of attachments) grid.append(card(attachment));
	section.append(grid);
	return section;
}

function card(attachment) {
	const item = node('article', `project-attachment project-attachment--${attachment.state}`);
	item.append(
		text('strong', attachmentLabel(attachment)),
		text('span', attachment.state.toUpperCase()),
		text('small', attachment.id)
	);
	return item;
}

function attachmentLabel(attachment) {
	if (attachment.kind === 'auth') return 'Identity';
	if (attachment.kind === 'domain') return 'Domain';
	return attachment.kind;
}

function text(tag, value) {
	const element = node(tag);
	element.textContent = value;
	return element;
}

function node(tag, className = '') {
	const element = document.createElement(tag);
	element.className = className;
	return element;
}
