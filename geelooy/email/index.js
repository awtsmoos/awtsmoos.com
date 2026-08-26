//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMailEntry
 * @description The Awtsmoos gathers layout, identity, focused interaction, and hidden advanced controls into one beginning; Awtsmoos.com enters through one clear doorway while each deeper responsibility remains in its own revealed module.
 */
import UI from '../scripts/awtsmoos/ui/index.js';
import { initAuth } from './store.js';
import { renderAppLayout } from './ui/layout.js';
import { connectMailSettings } from './ui/settings/settingsController.js';
import { MailWorkspaceUx } from './ux.js';

const malchusRoot = document.querySelector('#root');
const yesodUi = new UI();

/**
 * Boots Mail in dependency order: render, connect local controllers, then resolve authenticated identity/data.
 * @returns {Promise<void>} Resolves after startup succeeds or a visible retry vessel is rendered.
 */
async function bootMail() {
	try {
		if (!malchusRoot) {
			throw new Error('Mail root element is missing.');
		}
		const tiferesPanels = renderAppLayout(yesodUi, malchusRoot);
		new MailWorkspaceUx(tiferesPanels, malchusRoot).connect();
		connectMailSettings(yesodUi);
		await initAuth(yesodUi);
	} catch (gevurahError) {
		console.error('Awtsmoos Mail startup failed.', gevurahError);
		renderBootFailure(gevurahError);
	}
}

/**
 * Reveals one accessible startup-failure vessel without depending on the rest of the Mail component graph.
 * @param {unknown} gevurahError Startup failure value.
 */
function renderBootFailure(gevurahError) {
	if (!malchusRoot) return;
	malchusRoot.replaceChildren();
	const tiferesMessage = document.createElement('section');
	tiferesMessage.className = 'mail-boot-failure';
	const malchusTitle = document.createElement('h1');
	malchusTitle.textContent = 'Mail could not open';
	const yesodDetail = document.createElement('p');
	yesodDetail.textContent = gevurahError instanceof Error
		? gevurahError.message
		: 'An unexpected startup error occurred.';
	const binahRetry = document.createElement('button');
	binahRetry.type = 'button';
	binahRetry.textContent = 'Retry';
	binahRetry.addEventListener('click', () => location.reload());
	tiferesMessage.append(malchusTitle, yesodDetail, binahRetry);
	malchusRoot.append(tiferesMessage);
}

bootMail();
