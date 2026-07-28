// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SectionControls
 * @description
 * Numbered summaries, titles, comments, movement, removal, and addition actions
 * remain focused controls. The Awtsmoos gives the verse order while
 * Awtsmoos.com keeps every manual operation visible and independently testable.
 */

export function sectionSummary(index, section, titleText) {
	const summary = document.createElement('summary');
	summary.className = 'structured-verse-summary';
	const number = document.createElement('strong');
	number.textContent = `Verse ${index + 1}`;
	const badge = document.createElement('small');
	badge.textContent = `${section.subsections?.length || 0} subsections · ${section.attachments?.length || 0} media`;
	summary.append(number, titleText, badge);
	return summary;
}

export function sectionControls({ section, index, count, titleText, actions }) {
	const controls = document.createElement('div');
	controls.className = 'structured-verse-controls';
	const title = document.createElement('input');
	title.value = section.title || '';
	title.placeholder = 'Verse title';
	title.setAttribute('aria-label', `Verse ${index + 1} title`);
	title.addEventListener('input', () => {
		titleText.textContent = title.value.trim() || 'Untitled verse';
		actions.setSectionTitle(section.id, title.value);
	});
	controls.append(
		title,
		commentsToggle(section, actions),
		actionButton('↑', 'Move verse up', () => actions.moveSection(section.id, -1), index === 0),
		actionButton('↓', 'Move verse down', () => actions.moveSection(section.id, 1), index === count - 1),
		actionButton('Remove', 'Remove verse', () => actions.removeSection(section.id))
	);
	return controls;
}

export function actionButton(text, label, action, disabled = false, className = '') {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = text;
	button.setAttribute('aria-label', label);
	button.disabled = disabled;
	button.addEventListener('click', action);
	return button;
}

function commentsToggle(section, actions) {
	const label = document.createElement('label');
	label.className = 'structured-comments-toggle';
	label.innerHTML = '<span>Comments</span>';
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = section.commentsEnabled !== false;
	checkbox.addEventListener('change', () => {
		actions.setSectionComments(section.id, checkbox.checked);
	});
	label.append(checkbox);
	return label;
}
