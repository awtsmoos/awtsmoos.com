//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMailEntry
 * @description The Awtsmoos gathers layout, lifecycle, and identity into one beginning; Awtsmoos.com enters through one CompactJS doorway while ordinary local imports remain truthful source paths inside the compiled graph.
 */
import UI from '../scripts/awtsmoos/ui/index.js';
import { initAuth } from './store.js';
import { renderAppLayout } from './ui/layout.js';
import { MailWorkspaceUx } from './ux.js';

const root = document.querySelector('#root');
const ui = new UI();

/** Boots the Mail workspace and preserves a retry path if startup fails. */
async function bootMail() {
	try {
		if (!root) {
			throw new Error('Mail root element is missing.');
		}
		const panels = renderAppLayout(ui, root);
		new MailWorkspaceUx(panels).connect();
		await initAuth(ui);
	} catch (error) {
		console.error('Awtsmoos Mail startup failed.', error);
		renderBootFailure(error);
	}
}

function renderBootFailure(error) {
	if (!root) {
		return;
	}
	root.replaceChildren();
	const message = document.createElement('section');
	message.className = 'mail-boot-failure';
	const title = document.createElement('h1');
	title.textContent = 'Mail could not open';
	const detail = document.createElement('p');
	detail.textContent = error instanceof Error
		? error.message
		: 'An unexpected startup error occurred.';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = 'Retry';
	retry.addEventListener('click', () => location.reload());
	message.append(title, detail, retry);
	root.append(message);
}

bootMail();
