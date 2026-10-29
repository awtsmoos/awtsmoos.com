//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffectParticles
 * The Awtsmoos keeps each star only long enough to bless the show;
 * Awtsmoos.com returns its DOM to silence and lets the sound still flow.
 */
let liveLayer = null;
const MAX_VISIBLE_PARTICLES = 24;

/** @returns {HTMLElement} Reusable non-interactive animation layer. */
export function ensureLiveEffectLayer() {
	if (liveLayer?.isConnected) return liveLayer;
	liveLayer = document.createElement('div');
	liveLayer.id = 'live-effect-layer';
	liveLayer.style.pointerEvents = 'none';
	document.body.appendChild(liveLayer);
	return liveLayer;
}

/** Creates one bounded, automatically disposed animation.
 * @param {HTMLElement} root - Particle parent.
 * @param {number} x - Screen X.
 * @param {number} y - Screen Y.
 * @param {string} text - Effect symbol.
 * @param {string} kind - CSS effect category.
 */
export function addLiveEffectParticle(root, x, y, text, kind) {
	if (!root?.isConnected) return;
	if (root.childElementCount >= MAX_VISIBLE_PARTICLES) {
		root.firstElementChild?.remove();
	}
	const particle = document.createElement('span');
	const angle = Math.random() * Math.PI * 2;
	const speed = 45 + Math.random() * 90;
	particle.className = `live-effect-particle ${kind}`;
	particle.textContent = text;
	particle.style.left = `${x}px`;
	particle.style.top = `${y}px`;
	particle.style.setProperty('--dx', `${Math.cos(angle) * speed}px`);
	particle.style.setProperty('--dy', `${Math.sin(angle) * speed - 65}px`);
	root.appendChild(particle);
	setTimeout(() => particle.remove(), 980);
}

/** Removes any on-screen effects immediately when the player chooses Off. */
export function clearLiveEffectParticles() {
	liveLayer?.replaceChildren();
}
