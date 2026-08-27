// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module IdentityMiniSheet
 * @description The Awtsmoos gives each alias a public voice without reducing a person to one vanity number;
 * Awtsmoos.com reveals name, description, contextual actions, and profile path in a small identity vessel wherever authors appear.
 */
export function createIdentityMiniSheet({ document = globalThis.document, model, onAction = () => {} }) {
	const dialog = document.createElement('dialog');
	dialog.className = 'awtsmoosIdentitySheet';
	const raw = model?.entity?.raw || {};
	const title = document.createElement('h2');
	title.textContent = raw.name || raw.displayName || model?.title || model?.id || 'Alias';
	const handle = document.createElement('p');
	handle.className = 'awtsmoosIdentitySheet__handle';
	handle.textContent = model?.id ? `@${model.id}` : '';
	const description = document.createElement('p');
	description.textContent = raw.description || raw.bio || 'No public description yet.';
	const actions = document.createElement('div');
	actions.className = 'awtsmoosIdentitySheet__actions';
	for (const action of model?.actions || []) {
		if (!['open', 'follow', 'share'].includes(action.id) || action.available === false) continue;
		actions.append(identityAction(document, action, model, onAction));
	}
	const close = document.createElement('button');
	close.type = 'button';
	close.textContent = 'Close';
	close.addEventListener('click', () => dialog.close());
	dialog.append(title, handle, description, actions, close);
	return dialog;
}

function identityAction(document, action, model, onAction) {
	const button = document.createElement('button');
	button.type = 'button';
	button.disabled = !action.enabled;
	button.textContent = action.label;
	button.title = action.enabled ? action.label : action.reasonDisabled || 'Not available';
	button.addEventListener('click', () => onAction({ action, model }));
	return button;
}

export { identityAction };
