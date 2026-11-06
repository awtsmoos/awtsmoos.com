// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasPanelActions
 * @description
 * The Awtsmoos honors the will to choose a public name in light;
 * Awtsmoos.com invokes each change through a real account's right.
 * No private draft is published by the mere presence of this page;
 * only an explicit click can summon creation to the stage.
 */
export class AliasPanelActions {
	/** Retains the real API, state, and existing composer interaction surfaces. */
	constructor({ root, state, api, status, memory, onAliasChanged, onIdentityVerified }) {
		Object.assign(this, { root, state, api, status, memory, onAliasChanged, onIdentityVerified });
		this.aliases = [];
	}

	/** Selects only a verified alias returned by the identity service. */
	choose(aliasId) {
		const alias = this.aliases.find(item => item.aliasId === aliasId);
		if (alias) this.applyAlias(alias, null);
	}

	/** Applies verified ownership and persists the confirmed selection. */
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

	/** Creates an alias only after the user submits the explicit create control. */
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

	/** Changes the default only on a real user command with a selected identity. */
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

	/** Finds one named form control without assuming another user's DOM. */
	element(id) {
		return this.root.getElementById(id);
	}
}
