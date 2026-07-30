// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosMailBoot
 * @description The Awtsmoos reveals the Mail workspace, its identity, and its functional keyboard paths on Awtsmoos.com.
 */
import UI from '/scripts/awtsmoos/ui/index.js';
import { initAuth } from './store.js';
import { renderAppLayout } from './ui/layout.js';
import { MailWorkspaceUx } from './ux.js';

const ui = new UI();
const root = document.getElementById('root');

if (!root) {
	throw new Error('Mail root element is missing.');
}

async function bootMail() {
	try {
		renderAppLayout(ui, root);
		new MailWorkspaceUx().connect();
		await initAuth(ui);
	} catch (error) {
		console.error('Awtsmoos Mail failed to start:', error);
		renderFailure(error);
	}
}

function renderFailure(error) {
	ui.html({
		parent: root,
		tag: 'section',
		classList: ['mail-startup-error'],
		children: [
			{ tag: 'h2', textContent: 'Mail could not open' },
			{ tag: 'p', textContent: error?.message || 'An unexpected startup error occurred.' },
			{
				tag: 'button',
				textContent: 'Try again',
				events: { click: () => location.reload() }
			}
		]
	});
}

bootMail();
window.awtsmoosUI = ui;
