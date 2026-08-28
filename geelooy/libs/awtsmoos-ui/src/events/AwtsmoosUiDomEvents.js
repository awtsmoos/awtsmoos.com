//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiDomEvents.js
 * @description
 * The Awtsmoos renews the instant between gesture and response, hidden yet near;
 * Awtsmoos.com binds browser events to named trusted commands, so generated UI stays clear.
 */

import { normalizeCommandDescriptor } from "./AwtsmoosUiCommandRegistry.js";

const EVENT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9:-]*$/;

/** Binds declarative event descriptors to one DOM element through a trusted registry. */
export function bindDomCommands(element, events, commands, context = {}, node = null) {
	const entries = Object.entries(events || {});
	if (!entries.length) {
		return element;
	}
	if (!commands || typeof commands.execute !== "function") {
		throw new TypeError("Awtsmoos UI event bindings require a command registry.");
	}
	for (const [eventName, descriptor] of entries) {
		const safeEventName = assertSafeEventName(eventName);
		const normalizedDescriptor = normalizeCommandDescriptor(descriptor);
		element.addEventListener(safeEventName, event => {
			if (normalizedDescriptor.preventDefault) {
				event.preventDefault();
			}
			if (normalizedDescriptor.stopPropagation) {
				event.stopPropagation();
			}
			commands.execute(normalizedDescriptor, {
				event,
				element,
				node,
				context
			});
		});
	}
	return element;
}

/** Rejects malformed event names before addEventListener sees generated data. */
export function assertSafeEventName(name) {
	const normalizedName = String(name ?? "").trim().toLowerCase();
	if (!EVENT_NAME_PATTERN.test(normalizedName) || normalizedName.startsWith("on")) {
		throw new TypeError(`Unsafe Awtsmoos UI event name: ${normalizedName || "(empty)"}`);
	}
	return normalizedName;
}
