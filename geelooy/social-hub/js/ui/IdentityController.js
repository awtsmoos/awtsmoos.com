//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class IdentityController
 * @description
 * Verified alias bootstrap, switching, profile target, and logged-out guidance share
 * one public identity surface. The Awtsmoos knows the inward person directly while
 * Awtsmoos.com distinguishes authenticated ownership from the alias shown in public.
 */

const MEMORY_KEY = 'BH.socialHub.publicAlias.v1';

function rememberedAlias(storage = localStorage) {
	try {
		return JSON.parse(storage.getItem(MEMORY_KEY) || 'null')?.aliasId || '';
	} catch {
		return '';
	}
}

function rememberAlias(alias, storage = localStorage) {
	storage.setItem(MEMORY_KEY, JSON.stringify({
		aliasId: alias.aliasId,
		aliasName: alias.name || alias.aliasId,
		verifiedAt: Date.now()
	}));
}

export class IdentityController {
	constructor({ root, api, state, status, onChanged }) {
		Object.assign(this, { root, api, state, status, onChanged });
	}

	async initialize() {
		this.element('hubAliasSelect').addEventListener('change', event => {
			this.choose(event.target.value);
		});
		const snapshot = this.state.snapshot();
		const preferred = snapshot.identity.aliasId || rememberedAlias();
		try {
			const identity = await this.api.identity(preferred);
			this.applyIdentity(identity);
		} catch (error) {
			this.loggedOut(error.message);
		}
	}

	applyIdentity(identity) {
		const aliases = identity.aliases || [];
		const selected = identity.selectedAlias || aliases[0]?.aliasId || '';
		this.state.mutate('identity:loaded', value => {
			value.identity.loggedIn = Boolean(identity.loggedIn);
			value.identity.aliases = aliases;
			value.identity.aliasId = selected;
			if (!value.profileAliasId) value.profileAliasId = selected;
		});
		this.render(aliases, selected, identity.loggedIn);
		const alias = aliases.find(item => item.aliasId === selected);
		if (alias) rememberAlias(alias);
		this.onChanged?.(selected);
	}

	render(aliases, selected, loggedIn) {
		const select = this.element('hubAliasSelect');
		select.replaceChildren(new Option('Choose public alias', ''));
		for (const alias of aliases) {
			select.append(new Option(alias.name || alias.aliasId, alias.aliasId));
		}
		select.value = selected;
		select.disabled = !aliases.length;
		this.element('identityState').textContent = loggedIn
			? `${aliases.length} verified public alias${aliases.length === 1 ? '' : 'es'}`
			: 'Log in to use private activity and publish interactions.';
		this.element('loginLink').hidden = Boolean(loggedIn);
	}

	choose(aliasId) {
		const snapshot = this.state.snapshot();
		const alias = snapshot.identity.aliases.find(item => item.aliasId === aliasId);
		if (!alias) return;
		this.state.mutate('identity:changed', value => {
			value.identity.aliasId = aliasId;
			value.profileAliasId = aliasId;
		});
		rememberAlias(alias);
		this.onChanged?.(aliasId);
		this.status.show(`Acting as ${alias.name || aliasId}.`, 'success');
	}

	loggedOut(reason) {
		this.state.mutate('identity:logged-out', value => {
			value.identity.loggedIn = false;
			value.identity.aliases = [];
			value.identity.aliasId = '';
		});
		this.render([], '', false);
		this.status.show(reason || 'Log in to activate the Social Hub.', 'error', true);
	}

	element(id) {
		return this.root.getElementById(id);
	}
}

export {
	MEMORY_KEY,
	rememberedAlias,
	rememberAlias
};
