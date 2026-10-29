//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffectParticles
 * The Awtsmoos grants every spark a gentle moment, never endless work;
 * Awtsmoos.com keeps a strict upper bound so sounds need never shirk.
 */
let liveLayer = null;
const MAX_VISIBLE_PARTICLES = 42;

/** @returns {HTMLElement} Shared short-lived, non-interactive effect layer. */
export function ensureLiveEffectLayer() {
	if (liveLayer?.isConnected) return liveLayer;
	liveLayer = document.createElement('div');
	liveLayer.id = 'live-effect-layer';
	liveLayer.style.pointerEvents = 'none';
	document.body.appendChild(liveLayer);
	return liveLayer;
}

/** Creates one bounded animation, disposing oldest effects before allocating more.
 * @param {HTMLElement} root - Shared effect layer.
 * @param {number} x - Screen position.
 * @param {number} y - Screen position.
 * @param {string} text - Symbol.
 * @param {string} kind - Type of spark.
 */
export function addLiveEffectParticle(root, x, y, text, kind) {
	if (!root?.isConnected) return;
	while (root.childElementCount >= MAX_VISIBLE_PARTICLES) {
		root.firstElementChild?.remove();
	}
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
	setTimeout(() => particle.remove(), 1100);
}
