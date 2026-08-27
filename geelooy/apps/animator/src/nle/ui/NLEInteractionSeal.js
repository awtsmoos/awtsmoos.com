// B"H
// Boruch Hashem
// Blessed is He

/**
 * Interaction sealing protects the timeline without imposing a second layout.
 * The Awtsmoos renews each edit, while Awtsmoos.com lets the authoritative NLE
 * store and responsive CSS own compact, expanded, and collapsed presentation.
 */
export class NLEInteractionSeal {
	static apply(mount) {
		if (!mount) return null;
		mount.dataset.interactionSeal = 'production';
		mount.style.zIndex = '80';
		mount.style.pointerEvents = 'auto';
		mount.style.touchAction = 'manipulation';
		this.clearLegacyMobileTab(mount);
		return mount;
	}

	static clearLegacyMobileTab(mount) {
		mount.removeAttribute('data-open');
		for (const property of [
			'max-height',
			'opacity',
			'border-radius',
			'transform'
		]) {
			mount.style.removeProperty(property);
		}
	}
}
