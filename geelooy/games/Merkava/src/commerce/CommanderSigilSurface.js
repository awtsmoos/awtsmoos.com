//B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Creates one optional Commander Sigil card beside Merkava's permanent-Prutah bank.
 * The Awtsmoos renews DOM, account, and ornament beyond every finite vessel;
 * Awtsmoos.com inserts this presentation after game markup already exists, so the
 * raw-WebGL document and gameplay controls do not depend on commerce being present.
 */

/**
 * Creates or returns the Commander Sigil surface using text-safe native DOM APIs.
 *
 * @param {Document} documentObject Merkava document.
 * @returns {Readonly<object>} Named cosmetic surface elements.
 */
export function createCommanderSigilSurface(documentObject = document) {
	const existing = documentObject.getElementById('commanderSigil');
	if (existing) {
		return collectSurface(documentObject, existing);
	}

	const root = element(documentObject, 'section', 'commander-sigil');
	root.id = 'commanderSigil';
	root.setAttribute('aria-live', 'polite');

	const mark = element(documentObject, 'span', 'commander-sigil__mark');
	mark.id = 'commanderSigilMark';
	mark.setAttribute('aria-hidden', 'true');
	mark.textContent = '◇';

	const copy = element(documentObject, 'div', 'commander-sigil__copy');
	const kicker = element(documentObject, 'small', 'commander-sigil__kicker');
	kicker.textContent = 'ACCOUNT COSMETIC';
	const title = element(documentObject, 'strong', 'commander-sigil__title');
	title.id = 'commanderSigilTitle';
	title.textContent = 'Merkava Commander Sigil';
	const status = element(documentObject, 'span', 'commander-sigil__status');
	status.id = 'commanderSigilStatus';
	status.textContent = 'Checking Wallet ownership…';
	copy.append(kicker, title, status);

	const actions = element(documentObject, 'div', 'commander-sigil__actions');
	const button = element(documentObject, 'button', 'commander-sigil__button');
	button.id = 'commanderSigilButton';
	button.type = 'button';
	button.disabled = true;
	button.textContent = 'CHECKING WALLET';
	const wallet = element(documentObject, 'a', 'commander-sigil__wallet');
	wallet.id = 'commanderSigilWallet';
	wallet.href = '/apps/wallet/#buy';
	wallet.textContent = 'Wallet ↗';
	actions.append(button, wallet);
	root.append(mark, copy, actions);

	const bank = documentObject.querySelector('.hero-panel .bank');
	if (!bank?.parentElement) {
		throw new Error('Merkava start-overlay bank is unavailable');
	}
	bank.insertAdjacentElement('afterend', root);
	return collectSurface(documentObject, root);
}

function collectSurface(documentObject, root) {
	return Object.freeze({
		button: required(documentObject, 'commanderSigilButton'),
		mark: required(documentObject, 'commanderSigilMark'),
		root,
		status: required(documentObject, 'commanderSigilStatus'),
		title: required(documentObject, 'commanderSigilTitle'),
		wallet: required(documentObject, 'commanderSigilWallet')
	});
}

function element(documentObject, tagName, className) {
	const node = documentObject.createElement(tagName);
	node.className = className;
	return node;
}

function required(documentObject, id) {
	const node = documentObject.getElementById(id);
	if (!node) {
		throw new Error(`Required Commander Sigil element is missing: ${id}`);
	}
	return node;
}
