// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class AliasPanel
 * @description
 * The Awtsmoos reveals a public name only when the server speaks in light;
 * Awtsmoos.com keeps cached hints from masquerading as a verified right.
 * The writer's draft remains, but a failed account gate cannot publish tonight.
 */

import { AliasPanelActions } from './AliasPanelActions.js';
import { loadVerifiedIdentity } from './IdentityBootstrap.js';

export class AliasPanel extends AliasPanelActions {
	/** Loads public identity with a finite timeout and visible failure state. */
	async initialize() {
		this.bind();
		const remembered = this.memory.load();
		// B"H 2026-11-20 (composer publish cluster, defect 1): the
		// remembered hint is the last VERIFIED selection this panel
		// itself applied; state identity at boot can still carry a
		// deep-link seed, so it is only the fallback hint. (Draft
		// snapshots no longer contribute identity at all — see
		// ComposerWorkflow.restoreLocal.)
		// B"H 2026-11-20 (residuals round): a deep link INTO one Heichel
		// (?heichel=…, e.g. its "New series" pill, which also passes
		// ?alias=) reverses the order — the context seed names the
		// identity this Heichel was opened with and outranks a stale
		// remembered selection from another session. The seed is still
		// only a hint: loadVerifiedIdentity verifies it server-side, and
		// DestinationPanel additionally offers the Heichel's owner once
		// the destination detail lands.
		const contextSeed = this.state.context?.heichelId
			? (this.state.context.aliasId || this.state.snapshot().identity.aliasId || '')
			: '';
		const preferred = contextSeed || remembered?.aliasId || this.state.snapshot().identity.aliasId || '';
		try {
			this.renderIdentity(await loadVerifiedIdentity(this.api, preferred));
		} catch (error) {
			this.renderFallback(error.message);
		}
	}

	/** Retains the existing native alias selection and explicit action controls. */
	bind() {
		this.element('aliasSelect').addEventListener('change', event => this.choose(event.target.value));
		this.element('createAliasButton').addEventListener('click', () => this.create());
		this.element('setDefaultAliasButton').addEventListener('click', () => this.makeDefault());
	}

	/** Renders only the aliases returned by a currently verified account. */
	renderIdentity(identity) {
		this.aliases = identity.loggedIn ? identity.aliases || [] : [];
		this.element('loginNotice').hidden = identity.loggedIn;
		this.element('aliasCreation').hidden = !identity.loggedIn;
		this.element('aliasState').textContent = identity.loggedIn
			? `${this.aliases.length} public alias${this.aliases.length === 1 ? '' : 'es'} available.`
			: 'Log in to verify or create a public alias.';
		this.renderOptions(identity.loggedIn ? identity.selectedAlias || '' : '');
		const selected = this.aliases.find(alias => alias.aliasId === identity.selectedAlias);
		if (selected) this.applyAlias(selected, identity.memory);
		else this.clearUnverifiedAlias();
		this.onIdentityVerified?.(identity);
	}

	/** Builds a native select using server-verified aliases only. */
	renderOptions(selectedAlias) {
		const select = this.element('aliasSelect');
		select.replaceChildren(new Option('Choose an alias', ''));
		for (const alias of this.aliases) {
			select.append(new Option(alias.name || alias.aliasId, alias.aliasId));
		}
		select.value = selectedAlias;
		select.disabled = this.aliases.length === 0;
	}

	/** Ends a stalled verification with readable guidance and no assumed owner. */
	renderFallback(reason) {
		this.aliases = [];
		this.renderOptions('');
		this.clearUnverifiedAlias();
		this.element('loginNotice').hidden = false;
		this.element('aliasCreation').hidden = true;
		this.element('aliasState').textContent = 'Alias verification unavailable. Sign in and reload before publishing.';
		this.status.show('Unable to verify posting identity. Reload to try again.', 'error');
		console.warn('Alias bootstrap unavailable:', reason);
		this.onIdentityVerified?.({ loggedIn: false });
	}

	/** Clears only the active author identity, never the saved draft content. */
	clearUnverifiedAlias() {
		this.state.selectAlias(null);
		this.element('aliasId').value = '';
	}
}
