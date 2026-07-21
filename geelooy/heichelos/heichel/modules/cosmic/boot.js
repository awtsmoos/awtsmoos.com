// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelCosmicBoot
 * @description
 * The Awtsmoos gives the live Heichel one canonical procedural atmosphere.
 * Awtsmoos.com discovers real API cards, preserves adaptive performance, and
 * resonates around meaning without creating a copied renderer or second loop.
 */
import {
	ProceduralCosmicScene,
	REFERENCE_RGB,
	choosePerformanceProfile
} from "/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/index.js";

const SOURCE_ORDER = Object.freeze(["reflection", "audio", "question", "graph"]);
const SOURCE_COLORS = Object.freeze({
	reflection: REFERENCE_RGB.cyanCore,
	audio: REFERENCE_RGB.magentaCore,
	question: REFERENCE_RGB.aqua,
	graph: REFERENCE_RGB.violetCore
});

let releaseCurrentScene = null;

/** Boots one canonical scene against the current Heichel document. */
export function bootHeichelCosmicScene(documentRef = document) {
	if (releaseCurrentScene) return releaseCurrentScene;
	const canvas = ensureCanvas(documentRef);
	const scene = new ProceduralCosmicScene(canvas, {
		profile: choosePerformanceProfile()
	});
	if (!scene.available) return installFallback(documentRef, canvas);
	const releaseCards = observeCards(documentRef);
	const listeners = bindKinetics(scene, documentRef);
	delete documentRef.documentElement.dataset.cosmicFallback;
	canvas.dataset.heichelCosmicScene = "true";
	scene.start();
	updateFeedBounds(scene, documentRef);
	releaseCurrentScene = () => {
		listeners();
		releaseCards();
		scene.destroy();
		releaseCurrentScene = null;
	};
	return releaseCurrentScene;
}

function ensureCanvas(documentRef) {
	let canvas = documentRef.querySelector("[data-awtsmoos-cosmic-scene]");
	if (canvas) return canvas;
	canvas = documentRef.createElement("canvas");
	canvas.dataset.awtsmoosCosmicScene = "";
	canvas.className = "awtsmoos-cosmic-canvas";
	canvas.setAttribute("aria-hidden", "true");
	documentRef.body.prepend(canvas);
	return canvas;
}

function installFallback(documentRef, canvas) {
	documentRef.documentElement.dataset.cosmicFallback = "true";
	canvas.hidden = true;
	return () => {};
}

function observeCards(documentRef) {
	const discover = () => documentRef.querySelectorAll(".nav-card").forEach(markCard);
	const observer = new MutationObserver(discover);
	discover();
	observer.observe(documentRef.body, { childList: true, subtree: true });
	return () => observer.disconnect();
}

function markCard(card, index) {
	const source = card.dataset.type === "series"
		? "graph"
		: SOURCE_ORDER[index % SOURCE_ORDER.length];
	card.dataset.cosmicPost = "";
	card.dataset.sourceType = source;
	card.style.setProperty("--card-index", String(index));
}

function bindKinetics(scene, documentRef) {
	const onPointerMove = event => scene.setPointer(event.clientX, event.clientY);
	const onPointerLeave = () => scene.setPointerAway();
	const onResize = () => updateFeedBounds(scene, documentRef);
	const onResonance = event => resonate(scene, event.target.closest(".nav-card, [data-heichel-profile]"));
	const onRelease = event => {
		if (!event.relatedTarget?.closest?.(".nav-card, [data-heichel-profile]")) {
			scene.clearInteractionChannel("heichel-focus");
		}
	};
	window.addEventListener("pointermove", onPointerMove, { passive: true });
	window.addEventListener("pointerleave", onPointerLeave, { passive: true });
	window.addEventListener("resize", onResize, { passive: true });
	documentRef.addEventListener("pointerover", onResonance, true);
	documentRef.addEventListener("focusin", onResonance, true);
	documentRef.addEventListener("pointerout", onRelease, true);
	return () => {
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerleave", onPointerLeave);
		window.removeEventListener("resize", onResize);
		documentRef.removeEventListener("pointerover", onResonance, true);
		documentRef.removeEventListener("focusin", onResonance, true);
		documentRef.removeEventListener("pointerout", onRelease, true);
	};
}

function resonate(scene, element) {
	if (!element) return;
	const rectangle = element.getBoundingClientRect();
	const source = element.dataset.sourceType || "reflection";
	scene.setInteractionChannel("heichel-focus", {
		x: (rectangle.left + rectangle.width / 2) / Math.max(1, innerWidth),
		y: 1 - (rectangle.top + rectangle.height / 2) / Math.max(1, innerHeight),
		strength: 0.72,
		color: SOURCE_COLORS[source] || SOURCE_COLORS.reflection
	}, { priority: 1.25 });
}

function updateFeedBounds(scene, documentRef) {
	const stage = documentRef.querySelector(".geelooy-main-stage");
	if (stage) scene.setFeedBounds(stage.getBoundingClientRect());
}

function start() {
	bootHeichelCosmicScene(document);
}

document.readyState === "loading"
	? document.addEventListener("DOMContentLoaded", start, { once: true })
	: start();
