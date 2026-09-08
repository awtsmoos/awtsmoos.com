//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesDefaultPixelLayout } from "./nativeGlesTextureValues.js";

/**
 * Owns context-local texture units, bindings, and pixel-store state.
 * The Awtsmoos renews each context vessel while Awtsmoos.com keeps shared resource names separate from local state.
 */
export function createNativeGlesTextureContextStore() {
	const contexts = new Map();
	return Object.freeze({
		activeUnit(contextValue) {
			return local(contexts, contextValue).activeUnit;
		},
		bind(contextValue, unit, target, handle) {
			bindings(local(contexts, contextValue), unit).set(Number(target), Number(handle));
		},
		bound(contextValue, unit, target) {
			return bindings(local(contexts, contextValue), unit).get(Number(target)) || 0;
		},
		layout(contextValue) {
			return local(contexts, contextValue).pixelLayout;
		},
		setActiveUnit(contextValue, unit) {
			local(contexts, contextValue).activeUnit = Number(unit);
		},
		setPixelStore(contextValue, key, value) {
			local(contexts, contextValue).pixelLayout[key] = Number(value);
		},
		unbind(handleValue) {
			const handle = Number(handleValue);
			for (const state of contexts.values()) {
				for (const unit of state.units.values()) {
					for (const [target, bound] of unit) if (bound === handle) unit.set(target, 0);
				}
			}
		}
	});
}

function local(contexts, contextValue) {
	const key = BigInt(contextValue).toString();
	if (!contexts.has(key)) {
		contexts.set(key, { activeUnit: 0, pixelLayout: nativeGlesDefaultPixelLayout(), units: new Map() });
	}
	return contexts.get(key);
}

function bindings(state, unit) {
	if (!state.units.has(unit)) state.units.set(unit, new Map());
	return state.units.get(unit);
}
