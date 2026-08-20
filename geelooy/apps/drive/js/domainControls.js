//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainControls
 * @description
 * The Awtsmoos binds domain controls to fresh server testimony. Awtsmoos.com keeps
 * DOM lifecycle separate from domain operations, so every mutation is followed by
 * a reread instead of letting optimistic browser state impersonate DNS reality.
 */

import {
	claimDomainFromForm,
	DEFAULT_DOMAIN_API,
	loadDomainEntries,
	runDomainAction
} from './domainOperations.js';
import { renderDomainClaims } from './domainRecordsView.js';

export function bindDomainPanel(panel, options = {}) {
	const api = { ...DEFAULT_DOMAIN_API, ...(options.api || {}) };
	const confirmDelete = options.confirmDelete || (message => globalThis.confirm?.(message) === true);
	const copyText = options.copyText || (value => globalThis.navigator?.clipboard?.writeText(value));
	const listeners = [];
	bind(panel.form, 'submit', event => settle(claim(event)));
	bind(panel.mode, 'change', syncNameserverField);
	bind(panel.list, 'click', event => settle(handleListAction(event)));
	syncNameserverField();
	settle(refresh());
	return { destroy, refresh };

	async function refresh() {
		setStatus('Refreshing domain truth…');
		try {
			const entries = await loadDomainEntries(api);
			renderDomainClaims(panel.list, entries);
			setStatus(`${entries.length} custom domain${entries.length === 1 ? '' : 's'} · server state refreshed`);
			return entries;
		} catch (error) {
			setStatus(errorMessage(error));
			throw error;
		}
	}

	async function claim(event) {
		event.preventDefault();
		setStatus('Saving domain claim…');
		await claimDomainFromForm(api, panel.form);
		await refresh();
	}

	async function handleListAction(event) {
		const target = event.target.closest?.('button');
		if (!target) return;
		if (target.dataset.domainCopy !== undefined) {
			await copyText?.(target.dataset.domainCopy);
			setStatus('DNS value copied.');
			return;
		}
		const action = target.dataset.domainAction;
		const hostname = target.dataset.hostname;
		if (!action || !hostname || action === 'refresh') return refresh();
		if (action === 'delete' && !confirmDelete(`Delete the domain claim for ${hostname}?`)) return;
		setStatus(`${action} ${hostname}…`);
		await runDomainAction(api, action, hostname);
		await refresh();
	}

	function syncNameserverField() {
		const enabled = panel.mode.value === 'custom-nameservers';
		const input = panel.form.elements.nameservers;
		panel.nameservers.hidden = !enabled;
		input.disabled = !enabled;
		input.required = enabled;
	}

	function bind(target, type, listener) {
		target.addEventListener(type, listener);
		listeners.push(() => target.removeEventListener(type, listener));
	}

	function destroy() {
		for (const remove of listeners.splice(0)) remove();
	}

	function setStatus(message) {
		panel.status.textContent = message;
	}
}

function settle(promise) {
	promise.catch(() => {});
}

function errorMessage(error) {
	return error?.code || error?.message || 'Domain action failed.';
}
