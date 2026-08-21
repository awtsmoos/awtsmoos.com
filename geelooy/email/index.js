//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMailEntry
 * @description
 * The Awtsmoos gathers layout, identity, and interaction into one renewed beginning;
 * Awtsmoos.com mounts Mail into its current root vessel so no obsolete selector can darken the opening.
 */
import UI from '../scripts/awtsmoos/ui/index.js';
import { initAuth } from './store.js';
import { renderAppLayout } from './ui/layout.js';
import { MailWorkspaceUx } from './ux.js';

const root = document.querySelector('#root');
const ui = new UI();

/** Boots the Mail workspace and preserves a visible retry path if startup fails. */
async function bootMail() {
	if (!root) {
		throw new Error("B'H Mail root vessel #root is missing");
	}
	try {
		const panels = renderAppLayout(ui, root);
		new MailWorkspaceUx(panels).connect();
		await initAuth(ui);
	} catch (error) {
		console.error('Awtsmoos Mail startup failed.', error);
		renderBootFailure(error);
	}
}

/** Replaces a failed boot with an accessible emoji-led recovery vessel. */
function renderBootFailure(error) {
	root.replaceChildren();
	const message = document.createElement('section');
	message.className = 'mail-boot-failure';
	const title = document.createElement('h1');
	title.textContent = '📬 Mail could not open';
	const detail = document.createElement('p');
	detail.textContent = error instanceof Error
		? error.message
		: 'An unexpected startup error occurred.';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = '🔄 Retry Mail';
	retry.addEventListener('click', () => location.reload());
	message.append(title, detail, retry);
	root.append(message);
}

void bootMail();
