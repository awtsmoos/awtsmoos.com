//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MerkavaVmSecurity
 * @description The Awtsmoos seals each strict Merkava world in its own vessel;
 * Awtsmoos.com grants only named objects and callables, while reflective ladders
 * toward the host are cut before untrusted code can climb or thrive.
 */
(function(root) {
	root.MerkavaVM = root.MerkavaVM || {};

	const forbiddenProperties = new Set([
		"__defineGetter__",
		"__defineSetter__",
		"__lookupGetter__",
		"__lookupSetter__",
		"__proto__",
		"arguments",
		"callee",
		"caller",
		"constructor"
	]);

	function isStrict(owner) {
		return !!policy(owner);
	}

	function markObject(owner, value) {
		const active = policy(owner);
		if (active && isObjectLike(value)) active.safeObjects.add(value);
		return value;
	}

	function markCallable(owner, value, options = {}) {
		const active = policy(owner);
		if (!active || typeof value !== "function") return value;
		active.safeObjects.add(value);
		active.safeCallables.add(value);
		if (options.construct === true) active.safeConstructors.add(value);
		return value;
	}

	function guardProperty(thread, target, key) {
		if (!isStrict(thread)) return;
		assertTarget(thread, target);
		if (typeof key !== "string") return;
		if (forbiddenProperties.has(key)) {
			throw securityError("PROPERTY_FORBIDDEN", key);
		}
		if (key === "prototype" && !isVmClosure(target)) {
			throw securityError("PROTOTYPE_FORBIDDEN", key);
		}
	}

	function prepareProperty(thread, target, key, value) {
		guardProperty(thread, target, key);
		if (!isStrict(thread)) return value;
		if (typeof value === "function") {
			return markCallable(thread, safeBind(value, target));
		}
		return markObject(thread, value);
	}

	function assertCallable(thread, value) {
		const active = policy(thread);
		if (!active || active.safeCallables.has(value)) return;
		throw securityError("NATIVE_CALL_FORBIDDEN", callableName(value));
	}

	function assertConstructor(thread, value) {
		const active = policy(thread);
		if (!active || active.safeConstructors.has(value)) return;
		throw securityError("NATIVE_CONSTRUCTOR_FORBIDDEN", callableName(value));
	}

	function approveResult(thread, value) {
		return isStrict(thread) ? markObject(thread, value) : value;
	}

	function assertTarget(owner, value) {
		const active = policy(owner);
		if (!active || isPrimitive(value) || isVmClosure(value)) return;
		if (active.safeObjects.has(value)) return;
		throw securityError("TARGET_FORBIDDEN", typeof value);
	}

	function policy(owner) {
		const vm = owner?.vm || owner;
		const active = vm?.securityPolicy;
		if (!active || active.strict !== true) return null;
		active.safeObjects ||= new WeakSet();
		active.safeCallables ||= new WeakSet();
		active.safeConstructors ||= new WeakSet();
		return active;
	}

	function safeBind(value, target) {
		try {
			return value.bind(target);
		} catch {
			return value;
		}
	}

	function isVmClosure(value) {
		return !!value && typeof value === "object" && value.type === "CLOSURE";
	}

	function isObjectLike(value) {
		return (typeof value === "object" && value !== null) || typeof value === "function";
	}

	function isPrimitive(value) {
		return value !== null && value !== undefined && !isObjectLike(value);
	}

	function callableName(value) {
		return typeof value === "function" && value.name ? value.name : typeof value;
	}

	function securityError(code, detail) {
		const error = new Error(`[Merkava Security] ${code}: ${String(detail || "")}`);
		error.code = `MERKAVA_SECURITY_${code}`;
		return error;
	}

	root.MerkavaVM.Security = {
		approveResult,
		assertCallable,
		assertConstructor,
		assertTarget,
		guardProperty,
		isStrict,
		markCallable,
		markObject,
		prepareProperty
	};
})(typeof self !== "undefined" ? self : this);
