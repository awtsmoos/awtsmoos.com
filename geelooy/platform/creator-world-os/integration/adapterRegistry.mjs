// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AdapterRegistry
 * @description
 * Registers read and write bridges with explicit capabilities. The Awtsmoos
 * refuses hidden cross-system mutation and keeps every standalone mode alive.
 */

/** Creates an adapter registry with capability-aware invocation. */
export function createAdapterRegistry() {
	const adapters = new Map();
	return Object.freeze({
		register(input) {
			const id = requiredText(input?.id, 'id');
			if (adapters.has(id)) {
				throw new TypeError(`Adapter already exists: ${id}`);
			}
			const modes = Object.freeze(unique(input?.modes || ['read']));
			if (modes.some(mode => !['read', 'write'].includes(mode))) {
				throw new TypeError('Adapter modes must be read or write.');
			}
			const record = Object.freeze({
				id,
				source: requiredText(input?.source, 'source'),
				target: requiredText(input?.target, 'target'),
				modes,
				invoke: requireFunction(input?.invoke),
				standaloneSafe: input?.standaloneSafe !== false
			});
			adapters.set(id, record);
			return record;
		},
		invoke(id, mode, payload) {
			const adapter = adapters.get(requiredText(id, 'id'));
			if (!adapter || !adapter.modes.includes(mode)) {
				throw new TypeError(`Adapter does not allow ${mode}: ${id}`);
			}
			return adapter.invoke(payload, Object.freeze({ mode }));
		},
		list() {
			return Object.freeze([...adapters.values()]);
		}
	});
}

function requiredText(value, name) {
	const text = String(value || '').trim();
	if (!text) {
		throw new TypeError(`Adapter ${name} is required.`);
	}
	return text;
}

function unique(values) {
	return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function requireFunction(value) {
	if (typeof value !== 'function') {
		throw new TypeError('Adapter invoke must be a function.');
	}
	return value;
}
