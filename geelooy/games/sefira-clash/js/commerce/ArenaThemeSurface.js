//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Creates one collapsed Arena Theme disclosure outside simulation and outside the
 * menu host's replaceable markup. The Awtsmoos renews doorway, menu, and ornament;
 * Awtsmoos.com keeps planned commerce hidden, live commerce collapsed, and gameplay
 * entirely free of permanent store panels or pointer-blocking financial chrome.
 */

export function createArenaThemeSurface(documentObject = document) {
	const root = documentObject.createElement('details');
	root.id = 'arenaThemeControl';
	root.className = 'arenaThemeControl';
	root.hidden = true;
	root.dataset.menuVisible = 'false';

	const summary = documentObject.createElement('summary');
	summary.id = 'arenaThemeSummary';
	summary.textContent = 'Arena Theme';

	const content = documentObject.createElement('div');
	content.className = 'arenaThemeControl__content';
	const status = documentObject.createElement('p');
	status.id = 'arenaThemeStatus';
	status.textContent = 'Checking account cosmetic…';
	const actions = documentObject.createElement('div');
	actions.className = 'arenaThemeControl__actions';

	const button = documentObject.createElement('button');
	button.id = 'arenaThemeButton';
	button.type = 'button';
	button.disabled = true;
	button.textContent = 'CHECKING';
	const wallet = documentObject.createElement('a');
	wallet.id = 'arenaThemeWallet';
	wallet.href = '/apps/wallet/#buy';
	wallet.textContent = 'Wallet ↗';
	actions.append(button, wallet);
	content.append(status, actions);
	root.append(summary, content);

	const shell = documentObject.querySelector('.shell');
	if (!shell) {
		throw new Error('Sefira Clash shell is unavailable');
	}
	shell.append(root);
	return Object.freeze({
		button,
		root,
		status,
		summary,
		wallet
	});
}
