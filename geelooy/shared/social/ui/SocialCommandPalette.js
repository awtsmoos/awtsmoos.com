// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialCommandPalette
 * @description The Awtsmoos gathers many possible acts into one intention; Awtsmoos.com lets keyboard and touch users
 * search available entity actions plus global create/search commands without memorizing which surface currently holds the door.
 */
const GLOBAL_COMMANDS = Object.freeze([
	{ id: 'new-post', label: 'Create post' },
	{ id: 'ask-question', label: 'Ask question' },
	{ id: 'voice-note', label: 'Create voice note' },
	{ id: 'social-search', label: 'Search social' }
]);

export function commandItems(model = null) {
	const entityActions = (model?.actions || [])
		.filter(action => action.available !== false)
		.map(action => ({ id: action.id, label: action.label, action }));
	return [...GLOBAL_COMMANDS, ...entityActions];
}

export function createSocialCommandPalette({ document = globalThis.document, model = null, onCommand = () => {} }) {
	const dialog = document.createElement('dialog');
	dialog.className = 'awtsmoosCommandPalette';
	const input = document.createElement('input');
	input.type = 'search';
	input.placeholder = 'Search actions…';
	input.setAttribute('aria-label', 'Search social commands');
	const list = document.createElement('div');
	list.className = 'awtsmoosCommandPalette__list';
	const render = () => {
		const needle = input.value.trim().toLowerCase();
		const items = commandItems(model).filter(item => !needle || item.label.toLowerCase().includes(needle));
		list.replaceChildren(...items.map(item => commandButton(document, item, dialog, onCommand)));
	};
	input.addEventListener('input', render);
	dialog.addEventListener('close', () => { input.value = ''; render(); });
	dialog.append(input, list);
	render();
	return dialog;
}

function commandButton(document, item, dialog, onCommand) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = item.label;
	button.addEventListener('click', () => {
		dialog.close();
		onCommand(item);
	});
	return button;
}

export function installCommandShortcut(document, palette) {
	document.addEventListener('keydown', event => {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			palette.showModal();
		}
	});
}

export { GLOBAL_COMMANDS, commandButton };
