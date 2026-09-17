//B"H
// Boruch Hashem
// Blessed is He
/** Resolves Drive identity from the signed Awtsmoos session before asking a human to type anything. */
import {
	aliasDisplay,
	cleanAlias,
	ensureDefaultAlias,
	getAliases,
	setDefaultAlias
} from '../../../scripts/awtsmoos/social/aliasIdentity.js';
import { connectState } from './state.js';

export async function installDriveIdentity({ refresh, status, error }) {
	const form = document.querySelector('#connection-form');
	const select = document.querySelector('#alias-select');
	const chip = document.querySelector('#drive-alias-chip');
	const account = document.querySelector('#drive-account');
	form.addEventListener('submit', event => connectFromForm(event, { refresh, status, error }));
	select.addEventListener('change', () => switchAlias(select.value, { refresh, status, error }));
	status('Opening your Drive…');
	try {
		const identity = await ensureDefaultAlias();
		if (!identity?.alias) {
			populateAliases(select, []);
			chip.textContent = 'Choose account';
			account.open = true;
			status('Sign in or choose an alias to open Drive.');
			return identity;
		}
		const aliases = await getAliases().catch(() => []);
		populateAliases(select, aliases, identity.alias);
		connectSession(identity.alias, chip);
		await refresh();
		return identity;
	} catch (reason) {
		account.open = true;
		chip.textContent = 'Account';
		error(reason);
		return null;
	}
}

async function connectFromForm(event, handlers) {
	event.preventDefault();
	const values = Object.fromEntries(new FormData(event.currentTarget));
	const aliasId = cleanAlias(values.manualAliasId || values.aliasId);
	if (!aliasId) return handlers.status('Choose an alias first.');
	connectState({ ...values, aliasId });
	paintAlias(aliasId);
	if ((values.credentialType || 'session') === 'session') await setDefaultAlias(aliasId);
	document.querySelector('#drive-account').open = false;
	await handlers.refresh();
}

async function switchAlias(alias, handlers) {
	const clean = cleanAlias(alias);
	if (!clean) return;
	connectSession(clean, document.querySelector('#drive-alias-chip'));
	await setDefaultAlias(clean);
	await handlers.refresh();
}

function connectSession(alias, chip) {
	connectState({ aliasId: alias, credential: '', credentialType: 'session' });
	chip.textContent = aliasDisplay(alias);
	paintAlias(alias);
}

function paintAlias(alias) {
	const chip = document.querySelector('#drive-alias-chip');
	if (chip) chip.textContent = aliasDisplay(alias);
	document.body.dataset.driveAlias = alias;
}

function populateAliases(select, aliases, selected = '') {
	const ids = aliases.map(item => cleanAlias(item?.id || item?.aliasId || item)).filter(Boolean);
	if (selected && !ids.includes(selected)) ids.unshift(selected);
	select.replaceChildren(...ids.map(id => option(id, id === selected)));
	if (!ids.length) select.append(option('', true, 'No owned alias yet'));
}

function option(value, selected, label = aliasDisplay(value)) {
	const node = document.createElement('option');
	node.value = value;
	node.textContent = label;
	node.selected = selected;
	return node;
}
