//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommandSheetRenderer
 * @description The Awtsmoos lets one sheet reveal many commands without becoming their owner; Awtsmoos.com renders accessible icon tiles and theme palettes while existing controllers remain the only source of mutation.
 */
import { createIcon } from '../icons/Icon.js';

/** Creates the reusable backdrop, sheet, header, and scrolling body. */
export function createCommandSheetShell() {
	const backdrop = document.createElement('div');
	backdrop.className = 'command-sheet-backdrop';
	backdrop.hidden = true;
	backdrop.dataset.sheetClose = 'true';

	const sheet = document.createElement('section');
	sheet.className = 'command-sheet';
	sheet.hidden = true;
	sheet.setAttribute('role', 'dialog');
	sheet.setAttribute('aria-modal', 'false');
	const handle = document.createElement('span');
	handle.className = 'command-sheet-handle';
	const header = document.createElement('header');
	header.className = 'command-sheet-header';
	const title = document.createElement('h2');
	title.className = 'command-sheet-title';
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'command-sheet-close';
	close.dataset.sheetClose = 'true';
	close.setAttribute('aria-label', 'Close menu');
	close.append(createIcon('close', 20));
	const body = document.createElement('div');
	body.className = 'command-sheet-body';
	header.append(title, close);
	sheet.append(handle, header, body);
	return { backdrop, sheet, title, body };
}

/** Renders one trusted sheet definition into the existing body. */
export function renderCommandSheet(shell, definition, snapshot) {
	shell.title.textContent = `${definition.emoji} ${definition.title}`;
	shell.body.replaceChildren();
	for (const section of definition.sections) {
		const group = document.createElement('section');
		group.className = 'command-sheet-section';
		const heading = document.createElement('h3');
		heading.textContent = section.label;
		const grid = document.createElement('div');
		grid.className = 'command-sheet-grid';
		for (const item of section.items) {
			grid.append(createItem(item, snapshot));
		}
		group.append(heading, grid);
		shell.body.append(group);
	}
}

function createItem(item, snapshot) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'command-sheet-item';
	button.setAttribute('aria-label', item.label);
	if (item.action) button.dataset.action = item.action;
	if (item.insert) button.dataset.insert = item.insert;
	if (item.sheet) button.dataset.sheetOpen = item.sheet;
	if (item.theme) button.dataset.themeId = item.theme.id;
	if (item.danger) button.classList.add('is-danger');
	if (item.requiresSelection && !snapshot.selectedElement) button.disabled = true;
	button.append(createIcon(item.icon, 22));
	const text = document.createElement('span');
	text.className = 'command-sheet-item-label';
	text.textContent = item.emoji ? `${item.emoji} ${item.label}` : item.label;
	button.append(text);
	if (item.theme) button.append(createThemeSwatches(item.theme, snapshot));
	return button;
}

function createThemeSwatches(theme, snapshot) {
	const swatches = document.createElement('span');
	swatches.className = 'theme-swatches';
	for (const color of [theme.background, theme.headingColor, theme.textColor, theme.shapeFill]) {
		const swatch = document.createElement('span');
		swatch.style.background = color;
		swatches.append(swatch);
	}
	if (snapshot.document.themeId === theme.id) swatches.dataset.active = 'true';
	return swatches;
}
