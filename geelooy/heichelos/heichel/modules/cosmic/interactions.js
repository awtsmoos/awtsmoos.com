// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCosmicInteractions
 * @description
 * The Awtsmoos gives each live card a semantic color and one bounded resonance
 * channel without creating another animation loop.
 */
import { REFERENCE_RGB } from '/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/index.js';
import { markCosmicCard } from './card-archetypes.js';

const SOURCE_COLORS = Object.freeze({
	reflection: REFERENCE_RGB.cyanCore,
	audio: REFERENCE_RGB.magentaCore,
	question: REFERENCE_RGB.aqua,
	graph: REFERENCE_RGB.violetCore
});

export function observeCosmicCards(documentRef) {
	const discover = () => {
		documentRef.querySelectorAll('.nav-card').forEach(markCosmicCard);
	};
	const observer = new MutationObserver(discover);
	discover();
	observer.observe(documentRef.body, { childList: true, subtree: true });
	return () => observer.disconnect();
}

export function bindCosmicKinetics(scene, documentRef) {
	const onPointerMove = event => scene.setPointer(event.clientX, event.clientY);
	const onPointerLeave = () => scene.setPointerAway();
	const onResize = () => updateFeedBounds(scene, documentRef);
	const onResonance = event => {
		resonate(scene, event.target.closest('.nav-card, [data-heichel-profile]'));
	};
	const onRelease = event => {
		if (!event.relatedTarget?.closest?.('.nav-card, [data-heichel-profile]')) {
			scene.clearInteractionChannel('heichel-focus');
		}
	};
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerleave', onPointerLeave, { passive: true });
	window.addEventListener('resize', onResize, { passive: true });
	documentRef.addEventListener('pointerover', onResonance, true);
	documentRef.addEventListener('focusin', onResonance, true);
	documentRef.addEventListener('pointerout', onRelease, true);
	return () => {
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerleave', onPointerLeave);
		window.removeEventListener('resize', onResize);
		documentRef.removeEventListener('pointerover', onResonance, true);
		documentRef.removeEventListener('focusin', onResonance, true);
		documentRef.removeEventListener('pointerout', onRelease, true);
	};
}

export function updateFeedBounds(scene, documentRef) {
	const stage = documentRef.querySelector('.geelooy-main-stage');
	if (stage) scene.setFeedBounds(stage.getBoundingClientRect());
}

function resonate(scene, element) {
	if (!element) return;
	const rectangle = element.getBoundingClientRect();
	const source = element.dataset.sourceType || 'reflection';
	scene.setInteractionChannel('heichel-focus', {
		x: (rectangle.left + rectangle.width / 2) / Math.max(1, innerWidth),
		y: 1 - (rectangle.top + rectangle.height / 2) / Math.max(1, innerHeight),
		strength: 0.72,
		color: SOURCE_COLORS[source] || SOURCE_COLORS.reflection
	}, { priority: 1.25 });
}
