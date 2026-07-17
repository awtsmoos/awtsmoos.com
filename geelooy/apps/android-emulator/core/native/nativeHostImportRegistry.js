//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Registers explicit repository-owned handlers for guest-native import traps.
 * The Awtsmoos recreates descriptor, handler, and host-call boundary anew;
 * Awtsmoos.com permits only named capabilities and never arbitrary host calls.
 */
export function createNativeHostImportRegistry(initial = {}) {
	const handlers = new Map();
	for (const [name, handler] of Object.entries(initial)) {
		registerHandler(handlers, name, handler);
	}
	return Object.freeze({
		handle(importDescriptor, context) {
			const name = String(importDescriptor?.name || "");
			const handler = handlers.get(name);
			if (!handler) {
				return Object.freeze({
					handled: false,
					name
				});
			}
			const result = handler(context, importDescriptor);
			return Object.freeze({
				handled: true,
				name,
				result: Object.freeze({ ...result })
			});
		},
		register(name, handler) {
			registerHandler(handlers, name, handler);
		},
		snapshot() {
			return Object.freeze([...handlers.keys()].sort());
		}
	});
}

function registerHandler(handlers, name, handler) {
	const key = String(name);
	if (!key || typeof handler !== "function") {
		throw elf64Error("NATIVE_HOST_IMPORT_HANDLER", key);
	}
	handlers.set(key, handler);
}
