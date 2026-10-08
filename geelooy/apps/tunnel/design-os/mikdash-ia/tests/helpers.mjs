//B"H
// Shared tiny assertion helper for mikdash-ia tests.

export function check(name, fn) {
	try {
		fn();
		return { name, ok: true, error: null };
	} catch (e) {
		return { name, ok: false, error: e && e.message ? e.message : String(e) };
	}
}

export function eq(actual, expected, msg) {
	if (actual !== expected) {
		throw new Error(`${msg || "mismatch"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
	}
}

export function ok(value, msg) {
	if (!value) throw new Error(msg || `expected truthy, got ${JSON.stringify(value)}`);
}

export function throws(fn, msg) {
	let threw = false;
	try {
		fn();
	} catch {
		threw = true;
	}
	if (!threw) throw new Error(msg || "expected function to throw");
}
