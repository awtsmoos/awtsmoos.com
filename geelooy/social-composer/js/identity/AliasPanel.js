//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class AliasPanel
 * @description
 * Login state, owned aliases, inline creation, default selection, and safe memory
 * become one progressive identity gate. The Awtsmoos gives the private soul and
 * public garment; Awtsmoos.com verifies the garment without exposing the hidden seal.
 */
export class AliasPanel {
	constructor({ root, state, api, status, memory, onAliasChanged }) {
		Object.assign(this, { root, state, api, status, memory, onAliasChanged });
		this.aliases = [];
	}
	async initialize() {
		this.bind();
		const remembered = this.memory.load();
		const preferred = this.state.snapshot().identity.aliasId || remembered?.aliasId || '';
		try {
			const identity = await this.api.bootstrapIdentity(preferred);
			this.renderIdentity(identity);
		} catch (error) {
			this.renderFallback(preferred, error.message);
		}
	}
	bind() {
		this.element('aliasSelect').addEventListener('change', event => {
			this.choose(event.target.value);
		});
		this.element('createAliasButton').addEventListener('click', () => this.create());
		this.element('setDefaultAliasButton').addEventListener('click', () => this.makeDefault());
	}
	renderIdentity(identity) {
		this.aliases = identity.aliases || [];
		this.element('loginNotice').hidden = identity.loggedIn;
		this.element('aliasCreation').hidden = !identity.loggedIn;
		this.element('aliasState').textContent = identity.loggedIn
			? `${this.aliases.length} public alias${this.aliases.length === 1 ? '' : 'es'} available.`
			: 'Log in to verify or create a public alias.';
		this.renderOptions(identity.selectedAlias || '');
		const selected = this.aliases.find(alias => alias.aliasId === identity.selectedAlias);
		if (selected) this.applyAlias(selected, identity.memory);
	}
	renderOptions(selectedAlias) {
		const select = this.element('aliasSelect');
		select.replaceChildren(new Option('Choose an alias', ''));
		for (const alias of this.aliases) {
			select.append(new Option(alias.name || alias.aliasId, alias.aliasId));
		}
		select.value = selectedAlias;
		select.disabled = this.aliases.length === 0;
	}
	renderFallback(aliasId, reason) {
		this.aliases = aliasId ? [{ aliasId, name: aliasId }] : [];
		this.renderOptions(aliasId);
		this.element('loginNotice').hidden = Boolean(aliasId);
		this.element('aliasCreation').hidden = true;
		this.element('aliasState').textContent = aliasId
			? 'Using the alias supplied by this page; live ownership verification is unavailable.'
			: 'Live alias service unavailable. Log in and reload to publish.';
		if (aliasId) this.applyAlias(this.aliases[0], null);
		console.warn('Alias bootstrap fallback:', reason);
	}
	choose(aliasId) {
		const alias = this.aliases.find(item => item.aliasId === aliasId);
		if (alias) this.applyAlias(alias, null);
	}
	applyAlias(alias, memory) {
		this.state.selectAlias(alias);
		this.element('aliasId').value = alias.aliasId;
		this.memory.save(memory || {
			aliasId: alias.aliasId,
			aliasName: alias.name,
			defaultAlias: false,
			lastVerifiedAt: Date.now()
		});
		this.onAliasChanged?.(alias.aliasId);
	}
	async create() {
		const aliasName = this.element('newAliasName').value.trim();
		if (!aliasName) return this.status.show('Add an alias name.', 'error');
		this.status.show('Creating your public alias…', 'working');
		try {
			const identity = await this.api.createAlias({
				aliasName,
				description: this.element('newAliasDescription').value.trim(),
				setAsDefault: true
			});
			this.renderIdentity(identity);
			this.status.show('Alias created and selected.', 'success');
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}
	async makeDefault() {
		const aliasId = this.state.snapshot().identity.aliasId;
		if (!aliasId) return this.status.show('Choose an alias first.', 'error');
		try {
			this.renderIdentity(await this.api.selectDefaultAlias(aliasId));
			this.status.show('Default alias updated.', 'success');
		} catch (error) {
			this.status.show(error.message, 'error');
		}
	}
	element(id) {
		return this.root.getElementById(id);
	}
}
