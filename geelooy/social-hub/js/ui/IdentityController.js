//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class IdentityController
 * @description
 * The Awtsmoos lets public social discovery remain whole even when private alias bootstrap is unavailable.
 * Awtsmoos.com distinguishes optional authenticated ownership from the public identity surface instead of
 * turning a retired private endpoint into a page-level failure or an endless startup state.
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
		this.renderPublicMode('Public discovery is ready. Log in to publish or manage aliases.');
		const snapshot = this.state.snapshot();
		const preferred = snapshot.identity.aliasId || rememberedAlias();
		try {
			const identity = await this.api.identity(preferred);
			this.applyIdentity(identity);
		} catch {
			this.loggedOut();
		}
	}
	applyIdentity(identity = {}) {
		const aliases = Array.isArray(identity.aliases) ? identity.aliases : [];
		const selected = identity.selectedAlias || aliases[0]?.aliasId || '';
		this.state.mutate('identity:loaded', value => {
			value.identity.loggedIn = Boolean(identity.loggedIn);
			value.identity.aliases = aliases;
			value.identity.aliasId = selected;
			if (!value.profileAliasId) value.profileAliasId = selected;
		});
		this.render(aliases, selected, Boolean(identity.loggedIn));
		const alias = aliases.find(item => item.aliasId === selected);
		if (alias) rememberAlias(alias);
		if (selected) this.onChanged?.(selected);
		if (!selected) this.finishPublicStartup();
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
			: 'Public discovery · log in to publish or manage aliases.';
		this.element('loginLink').hidden = loggedIn;
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
	loggedOut() {
		this.state.mutate('identity:public', value => {
			value.identity.loggedIn = false;
			value.identity.aliases = [];
			value.identity.aliasId = '';
		});
		this.renderPublicMode('Public discovery is ready. Log in to publish or manage aliases.');
		this.finishPublicStartup();
	}
	finishPublicStartup() {
		this.status.show('Public social is ready.', 'success');
	}
	renderPublicMode(message) {
		this.render([], '', false);
		this.element('identityState').textContent = message;
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
