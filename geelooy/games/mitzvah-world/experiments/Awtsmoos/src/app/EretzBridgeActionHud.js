// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBridgeActionHud.js
 * @description Displays one honest physical bridge action and routes actual click/E to its provider.
 * Awtsmoos.com lets the player choose a righteous deed;
 * the Awtsmoos gives a doorway only when its conditions heed.
 */

/** A small owned DOM control, refreshed from authoritative contextual-action state. */
export class EretzBridgeActionHud {
	constructor(runtime, providers, environment = globalThis) {
		this.runtime = runtime;
		this.providers = providers;
		this.environment = environment;
		this.active = null;
		const document = environment.document;
		if (!document?.createElement || !document?.body) return;
		this.button = document.createElement('button');
		this.button.type = 'button';
		this.button.dataset.eretzBridgeAction = 'true';
		this.button.setAttribute('aria-label', 'Village bridge quest action');
		this.button.style.cssText = 'position:fixed;left:50%;bottom:112px;transform:translateX(-50%);z-index:1300;padding:13px 22px;background:#163c31;color:#fff8e6;border:2px solid #d4b16e;border-radius:12px;font:700 16px sans-serif;cursor:pointer;display:none';
		this.button.addEventListener('click', this.activate);
		this.keydown = event => {
			if (event.code === 'KeyE' && !event.repeat && this.active && !event.target?.closest?.('input,textarea,[contenteditable]')) {
				this.activate();
			}
		};
		document.addEventListener('keydown', this.keydown);
		document.body.appendChild(this.button);
	}

	activate = () => {
		if (!this.active || this.runtime.destroyed) return false;
		const { provider, state } = this.active;
		if (provider.state().kind !== state.kind) return false;
		const result = provider.activate(state);
		this.update();
		return result;
	};

	update() {
		if (!this.button) return;
		this.active = this.providers.map(provider => ({provider, state: provider.state()}))
			.find(({state}) => state?.kind && state.kind !== 'hidden') || null;
		this.button.style.display = this.active ? 'block' : 'none';
		if (this.active) this.button.textContent = `[E] ${this.active.state.label || 'Bridge action'}`;
	}

	destroy() {
		this.environment.document?.removeEventListener?.('keydown', this.keydown);
		this.button?.removeEventListener?.('click', this.activate);
		this.button?.remove?.();
		this.active = null;
	}
}
