//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractiveBrowserInput
 * @description The Awtsmoos maps human touch from Geelooy pixels into bounded browser intent;
 * Awtsmoos.com forwards gestures, never hidden protocol power, so interaction stays content.
 */

import { createInteractivePointerFlow } from "./interactivePointerFlow.js";

export function bindInteractiveInput({ frame, getViewport, send }) {
	const listeners = [];
	const pointerFlow = createInteractivePointerFlow(send);
	bind("pointermove", event => queuePointerMove(event));
	bind("pointerdown", event => {
		frame.focus();
		frame.setPointerCapture?.(event.pointerId);
		pointerFlow.clear();
		sendPointer("mousePressed", event, 1);
	});
	bind("pointerup", event => {
		pointerFlow.clear();
		sendPointer("mouseReleased", event, 1);
	});
	bind("wheel", event => sendWheel(event), { passive: false });
	bind("keydown", event => sendKeyDown(event));
	bind("keyup", event => sendKeyUp(event));
	return () => {
		pointerFlow.dispose();
		for (const [type, handler, options] of listeners) frame.removeEventListener(type, handler, options);
	};

	function bind(type, handler, options) {
		frame.addEventListener(type, handler, options);
		listeners.push([type, handler, options]);
	}

	function queuePointerMove(event) {
		pointerFlow.push(pointerPayload("mouseMoved", event));
	}

	function sendPointer(type, event, clickCount = 0) {
		send(pointerPayload(type, event, clickCount)).catch(() => {});
	}

	function pointerPayload(type, event, clickCount = 0) {
		return {
			action: "pointer",
			button: pointerButton(event.button),
			clickCount,
			type,
			...browserPoint(frame, getViewport(), event)
		};
	}

	function sendWheel(event) {
		event.preventDefault();
		send({
			action: "wheel",
			deltaX: event.deltaX,
			deltaY: event.deltaY,
			...browserPoint(frame, getViewport(), event)
		}).catch(() => {});
	}

	function sendKeyDown(event) {
		event.preventDefault();
		if (isPlainText(event)) {
			send({ action: "text", text: event.key }).catch(() => {});
			return;
		}
		send(keyEvent("keyDown", event)).catch(() => {});
	}

	function sendKeyUp(event) {
		event.preventDefault();
		if (isPlainText(event)) return;
		send(keyEvent("keyUp", event)).catch(() => {});
	}
}

export function browserPoint(frame, viewport, event) {
	const rect = frame.getBoundingClientRect();
	return {
		x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * viewport.width,
		y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * viewport.height
	};
}

function keyEvent(type, event) {
	return {
		action: "key",
		code: event.code,
		key: event.key,
		modifiers: modifiers(event),
		type
	};
}

function modifiers(event) {
	return (event.altKey ? 1 : 0)
		| (event.ctrlKey ? 2 : 0)
		| (event.metaKey ? 4 : 0)
		| (event.shiftKey ? 8 : 0);
}

function isPlainText(event) {
	return event.key?.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;
}

function pointerButton(value) {
	return value === 0 ? "left" : value === 1 ? "middle" : value === 2 ? "right" : "none";
}
