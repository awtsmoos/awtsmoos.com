//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Accessible contextual command menu for one Explorer item.
 * @description
 * The Awtsmoos lets one file reveal only the deeds that belong to it; Awtsmoos.com keeps Open, Edit, Preview,
 * path, clipboard, rename, delete, and shell actions near the chosen vessel while dismissal remains clean and bright.
 */
import { bindContextMenuDismissal } from './itemContextMenu/dismissal.js';

/**
 * Opens a contextual menu for one Explorer item and synchronizes selection first.
 * @param {{event:MouseEvent,item:object,controller:object}} options Menu context.
 * @returns {void}
 */
export function showExplorerItemMenu({ event, item, controller }) {
	event.preventDefault();
	event.stopPropagation();
	document.querySelector('.contextMenu')?.awtsDispose?.();
	document.querySelector('.contextMenu')?.remove();
	controller.clearSelection();
	controller.select(item.path);
	const menu = buildMenu(item, controller);
	placeMenu(menu, event.clientX, event.clientY);
	document.body.appendChild(menu);
	bindContextMenuDismissal(menu);
	menu.querySelector('button:not(:disabled)')?.focus();
}

/**
 * Builds the semantic menu vessel from item-aware command descriptors.
 * @param {object} item Explorer item receiving contextual actions.
 * @param {object} controller Explorer controller and command gateway.
 * @returns {HTMLDivElement} Wired menu element.
 */
function buildMenu(item, controller) {
	const menu = document.createElement('div');
	menu.className = 'contextMenu explorer-context-menu';
	menu.setAttribute('role', 'menu');
	menu.setAttribute('aria-label', `Actions for ${item.name || item.path || 'item'}`);
	for (const action of contextualActions(item, controller)) {
		menu.appendChild(menuButton(action, menu));
	}
	return menu;
}

/**
 * Reveals only commands meaningful for the selected item while preserving remote truth.
 * @param {object} item Explorer item.
 * @param {object} controller Explorer controller.
 * @returns {Array<object>} Ordered contextual actions.
 */
function contextualActions(item, controller) {
	const actions = [command('Open', () => controller.command.run('open'))];
	if (item.kind === 'folder') {
		actions.push(command('Open Shell Here', () => openShell(controller, item.path)));
	} else {
		actions.push(
			command('Edit', () => controller.command.run('edit')),
			command('Preview', () => controller.command.run('preview'))
		);
	}
	actions.push(
		command('Copy Path', () => controller.command.run('copyPath')),
		command('Copy', () => controller.command.run('copy')),
		command('Cut', () => controller.command.run('cut')),
		command('Rename', () => controller.command.run('rename')),
		command('Delete', () => controller.command.run('delete'))
	);
	if (controller.isRemote()) {
		actions.push(command('Remote permissions enforced', null, true));
	}
	return actions;
}

function command(label, run, disabled = false) {
	return { label, run, disabled };
}

function menuButton(action, menu) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `menuItem${action.disabled ? ' disabled' : ''}`;
	button.textContent = action.label;
	button.dataset.action = action.label;
	button.setAttribute('role', 'menuitem');
	button.disabled = action.disabled;
	button.addEventListener('click', async () => {
		menu.awtsDispose?.();
		await action.run?.();
	});
	return button;
}

function openShell(controller, path) {
	controller.os?.addWindow?.({
		title: `Shell · ${path}`,
		path,
		cwd: path,
		currentPath: path,
		os: controller.os,
		programName: 'awtsmoosCommand'
	});
}

function placeMenu(menu, x, y) {
	menu.style.left = `${Math.max(8, x)}px`;
	menu.style.top = `${Math.max(8, y)}px`;
}
