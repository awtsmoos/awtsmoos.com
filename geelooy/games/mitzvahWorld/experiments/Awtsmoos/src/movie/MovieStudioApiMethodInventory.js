// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiMethodInventory.js
 * @description Discovers and invokes every callable leaf of the published Movie Studio API.
 * The Awtsmoos renews every finite doorway from one light; Awtsmoos.com names each method
 * without awakening getters, crossing cycles, or mistaking hidden unsafe power for ordinary use.
 */

export function listMovieStudioApiMethods(api, options = {}) {
	const methods = [];
	walk(api, '', new WeakSet(), methods, options);
	return Object.freeze(methods.sort((left, right) => left.path.localeCompare(right.path)));
}

export function describeMovieStudioApiMethod(api, path, options = {}) {
	return listMovieStudioApiMethods(api, options).find(method => method.path === path) || null;
}

export async function invokeMovieStudioApiMethod(api, path, args = [], options = {}) {
	const resolved = resolveMethod(api, path);
	if (!resolved) return failure('MOVIE_API_METHOD_NOT_FOUND', `Unknown API method: ${path}`);
	if (path.startsWith('unsafe.') && !options.allowUnsafe) {
		return failure('MOVIE_API_UNSAFE_LOCKED', `Unsafe API method is locked: ${path}`);
	}
	if (!Array.isArray(args)) return failure('MOVIE_API_ARGUMENTS_INVALID', 'Arguments must be an array.');
	try {
		const value = await resolved.method.apply(resolved.owner, args);
		return { ok: true, path, value: serializable(value) };
	} catch (error) {
		return failure(error?.code || 'MOVIE_API_INVOCATION_FAILED', error?.message || String(error), path);
	}
}

function walk(value, prefix, seen, methods, options) {
	if (!value || (typeof value !== 'object' && typeof value !== 'function')) return;
	if (seen.has(value)) return;
	seen.add(value);
	for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
		if (name === 'constructor' || !('value' in descriptor)) continue;
		const path = prefix ? `${prefix}.${name}` : name;
		if (typeof descriptor.value === 'function') {
			if (!options.includeUnsafe && path.startsWith('unsafe.')) continue;
			methods.push(Object.freeze({
				arity: descriptor.value.length,
				async: descriptor.value.constructor?.name === 'AsyncFunction',
				path,
				unsafe: path.startsWith('unsafe.')
			}));
			continue;
		}
		walk(descriptor.value, path, seen, methods, options);
	}
}

function resolveMethod(api, path) {
	const parts = String(path || '').split('.').filter(Boolean);
	let owner = api;
	for (let index = 0; index < parts.length - 1; index += 1) {
		const descriptor = Object.getOwnPropertyDescriptor(owner, parts[index]);
		if (!descriptor || !('value' in descriptor)) return null;
		owner = descriptor.value;
		if (!owner) return null;
	}
	const descriptor = Object.getOwnPropertyDescriptor(owner, parts.at(-1));
	return typeof descriptor?.value === 'function'
		? { method: descriptor.value, owner }
		: null;
}

function serializable(value) {
	if (value === undefined) return null;
	try {
		return JSON.parse(JSON.stringify(value));
	} catch {
		return String(value);
	}
}

function failure(code, message, path = null) {
	return { ok: false, error: { code, message }, path };
}
