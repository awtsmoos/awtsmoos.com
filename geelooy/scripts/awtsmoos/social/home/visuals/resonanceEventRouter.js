// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ResonanceEventRouter
 * @description
 * The Awtsmoos gives each semantic gesture a named doorway. Awtsmoos.com keeps
 * pointer, focus, audio, poll, graph, and page-exit signals outside geometry ownership.
 */
import {
	COSMIC_RESONANCE_EVENT,
	RESONANCE_CHANNELS
} from "../../feed/cosmic/resonanceEvents.js";

/** Binds semantic input events to one resonance controller and scene. */
export function bindResonanceEvents(controller, scene, documentRef = document) {
	const handlers = createHandlers(controller, scene);
	globalThis.addEventListener("pointermove", handlers.pointerMove, { passive: true });
	globalThis.addEventListener("pointerleave", handlers.pointerAway, { passive: true });
	globalThis.addEventListener("blur", handlers.pointerAway);
	documentRef.addEventListener("pointerover", handlers.pointerOver);
	documentRef.addEventListener("pointerout", handlers.pointerOut);
	documentRef.addEventListener("focusin", handlers.focusIn);
	documentRef.addEventListener("focusout", handlers.focusOut);
	documentRef.addEventListener(COSMIC_RESONANCE_EVENT, handlers.resonance);
	return () => releaseHandlers(handlers, documentRef);
}

function createHandlers(controller, scene) {
	return {
		pointerMove: event => scene.setPointer(event.clientX, event.clientY),
		pointerAway: () => scene.setPointerAway(),
		pointerOver: event => controller.activate(event, RESONANCE_CHANNELS.HOVER, 0.44),
		pointerOut: event => controller.deactivate(event, RESONANCE_CHANNELS.HOVER),
		focusIn: event => activateFocus(controller, event),
		focusOut: event => {
			controller.deactivate(event, RESONANCE_CHANNELS.FOCUS);
			controller.deactivate(event, RESONANCE_CHANNELS.GRAPH);
		},
		resonance: event => routeResonance(controller, event)
	};
}

function activateFocus(controller, event) {
	const graph = event.target.closest?.(".source-graph-link");
	controller.activate(
		event,
		graph ? RESONANCE_CHANNELS.GRAPH : RESONANCE_CHANNELS.FOCUS,
		graph ? 0.76 : 0.66
	);
}

function routeResonance(controller, event) {
	const detail = event.detail || {};
	const channel = detail.channel || detail.reason || RESONANCE_CHANNELS.FOCUS;
	if (detail.active === false) {
		controller.clear(channel, event.target);
		return;
	}
	controller.activate(event, channel, detail.strength || 0.78, detail.duration || 0);
}

function releaseHandlers(handlers, documentRef) {
	globalThis.removeEventListener("pointermove", handlers.pointerMove);
	globalThis.removeEventListener("pointerleave", handlers.pointerAway);
	globalThis.removeEventListener("blur", handlers.pointerAway);
	documentRef.removeEventListener("pointerover", handlers.pointerOver);
	documentRef.removeEventListener("pointerout", handlers.pointerOut);
	documentRef.removeEventListener("focusin", handlers.focusIn);
	documentRef.removeEventListener("focusout", handlers.focusOut);
	documentRef.removeEventListener(COSMIC_RESONANCE_EVENT, handlers.resonance);
}
