//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffectParticles
 * @description
 * The Awtsmoos gives every visual spark a short path and a definite return;
 * Awtsmoos.com creates and removes each particle here, so orchestration need not carry DOM animation concern.
 */

let liveLayer = null;

/**
 * @description Creates the shared transient effect layer once and reuses it for every short-lived particle.
 * @returns {HTMLDivElement} Shared live-effect layer attached to document.body.
 */
export function ensureLiveEffectLayer() {
	if (liveLayer?.isConnected) {
		return liveLayer;
	}

	liveLayer = document.createElement('div');
	liveLayer.id = 'live-effect-layer';
	document.body.appendChild(liveLayer);
	return liveLayer;
}

/**
 * @description Creates one particle with randomized outward motion and removes it after its short visual lifetime.
 * @param {HTMLElement} root - Shared effect layer receiving the particle.
 * @param {number} x - Page-space horizontal origin in pixels.
 * @param {number} y - Page-space vertical origin in pixels.
 * @param {string} text - Character, emoji, or note label to render.
 * @param {string} kind - CSS particle-kind class controlling appearance.
 * @returns {void}
 */
export function addLiveEffectParticle(root, x, y, text, kind) {
	const particle = document.createElement('span');
	const angle = Math.random() * Math.PI * 2;
	const speed = 45 + Math.random() * 120;

	particle.className = `live-effect-particle ${kind}`;
	particle.textContent = text;
	particle.style.left = `${x}px`;
	particle.style.top = `${y}px`;
	particle.style.setProperty('--dx', `${Math.cos(angle) * speed}px`);
	particle.style.setProperty('--dy', `${Math.sin(angle) * speed - 80}px`);
	root.appendChild(particle);
	setTimeout(() => {
		particle.remove();
	}, 1100);
}
