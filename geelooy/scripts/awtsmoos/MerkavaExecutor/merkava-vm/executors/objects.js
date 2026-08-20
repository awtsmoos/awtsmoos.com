//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MerkavaVmObjectExecutors
 * @description The Awtsmoos gives every object a measured vessel and every key a gate;
 * Awtsmoos.com lets strict worlds touch only approved matter, while constructor paths
 * and hidden prototype ladders dissolve before they can escape the virtual state.
 */
(function(root) {
	root.MerkavaVM = root.MerkavaVM || {};
	root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];

	const handlers = root.MerkavaVM.OpHandlers;

	handlers[0x30] = thread => thread.push(markObject(thread, {}));
	handlers[0x31] = thread => thread.push(markObject(thread, []));
	handlers[0x32] = thread => getProperty(thread);
	handlers[0x33] = thread => setProperty(thread);
	handlers[0x34] = thread => deleteProperty(thread);
	handlers[0xB3] = thread => appendValue(thread);
	handlers[0xB4] = thread => appendSpread(thread);
	handlers[0xB5] = thread => assignObject(thread);
	handlers[0xB6] = thread => objectRest(thread);
	handlers[0xA4] = thread => enumerateKeys(thread);
	handlers[0xA6] = thread => pushWithScope(thread);
	handlers[0xA7] = thread => thread.withStack?.pop();

	function getProperty(thread) {
		const key = thread.pop();
		const target = thread.pop();
		if (target == null) {
			console.warn(`[VM] GET_PROP '${String(key)}' on null/undefined.`);
			thread.push(undefined);
			return;
		}
		if (isStrict(thread)) {
			const value = target[key];
			thread.push(security().prepareProperty(thread, target, key, value));
			return;
		}
		thread.push(legacyProperty(target, key));
	}

	function setProperty(thread) {
		const value = thread.pop();
		const key = thread.pop();
		const target = thread.pop();
		if (target == null) {
			console.error(`[VM] SET_PROP '${String(key)}' on null/undefined.`);
			thread.push(value);
			return;
		}
		security()?.guardProperty(thread, target, key);
		const assigned = eventClosure(thread, key, value);
		if (!isStrict(thread) && legacyStyleTarget(target)) {
			target.setProperty ? target.setProperty(key, String(assigned)) : target[key] = assigned;
		} else {
			target[key] = assigned;
		}
		thread.push(value);
	}

	function deleteProperty(thread) {
		const key = thread.pop();
		const target = thread.pop();
		security()?.guardProperty(thread, target, key);
		thread.push(delete target[key]);
	}

	function appendValue(thread) {
		const value = thread.pop();
		const target = thread.peek();
		security()?.assertTarget(thread, target);
		if (Array.isArray(target)) target.push(value);
	}

	function appendSpread(thread) {
		const source = thread.pop();
		const target = thread.peek();
		security()?.assertTarget(thread, target);
		security()?.assertTarget(thread, source);
		if (Array.isArray(target) && source?.[Symbol.iterator]) target.push(...source);
	}

	function assignObject(thread) {
		const source = thread.pop();
		const target = thread.peek();
		security()?.assertTarget(thread, source);
		security()?.assertTarget(thread, target);
		if (source == null) return;
		if (!isStrict(thread)) {
			Object.assign(target, source);
			return;
		}
		for (const key of Reflect.ownKeys(source)) {
			if (!Object.getOwnPropertyDescriptor(source, key)?.enumerable) continue;
			security().guardProperty(thread, source, key);
			security().guardProperty(thread, target, key);
			target[key] = security().prepareProperty(thread, source, key, source[key]);
		}
	}

	function objectRest(thread) {
		const excluded = new Set((thread.pop() || []).map(String));
		const source = thread.pop();
		const rest = markObject(thread, {});
		security()?.assertTarget(thread, source);
		if (source != null) {
			for (const key in source) {
				if (excluded.has(key)) continue;
				security()?.guardProperty(thread, source, key);
				rest[key] = isStrict(thread)
					? security().prepareProperty(thread, source, key, source[key])
					: source[key];
			}
		}
		thread.push(rest);
	}

	function enumerateKeys(thread) {
		const target = thread.pop();
		security()?.assertTarget(thread, target);
		const keys = [];
		for (const key in target) {
			security()?.guardProperty(thread, target, key);
			keys.push(key);
		}
		thread.push(markObject(thread, keys[Symbol.iterator]()));
	}

	function pushWithScope(thread) {
		const target = thread.pop();
		security()?.assertTarget(thread, target);
		thread.withStack ||= [];
		thread.withStack.push(target);
	}

	function eventClosure(thread, key, value) {
		if (value?.type !== "CLOSURE" || typeof key !== "string" || !key.startsWith("on")) {
			return value;
		}
		return root.MerkavaVM.ClosureBridge?.wrapClosure(thread, value) || value;
	}

	function legacyProperty(target, key) {
		let value = target[key];
		if (value === undefined && typeof key === "string"
			&& ["values", "keys", "entries"].includes(key)
			&& typeof self !== "undefined" && self.Object) {
			value = self.Object[key];
		}
		if (typeof value === "function" && !value._merkavaClosure) {
			try {
				if (value.toString().includes("[native code]") && !value.name.startsWith("bound ")) {
					value = value.bind(target);
				}
			} catch {
				return value;
			}
		}
		return value;
	}

	function legacyStyleTarget(target) {
		return typeof CSSStyleDeclaration !== "undefined" && target instanceof CSSStyleDeclaration;
	}

	function markObject(thread, value) {
		return security()?.markObject(thread, value) || value;
	}

	function isStrict(thread) {
		return security()?.isStrict(thread) === true;
	}

	function security() {
		return root.MerkavaVM.Security;
	}
})(typeof self !== "undefined" ? self : this);
