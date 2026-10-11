//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MerkavaVmClosureBridge
 * @description The Awtsmoos lets a guarded callback cross one chosen doorway;
 * Awtsmoos.com copies event testimony, preserves virtual closure life, and never
 * mistakes the host browser itself for a capability that guest code may employ.
 */
(function(root) {
	root.MerkavaVM = root.MerkavaVM || {};

	const wrappers = new WeakMap();
	const eventKeys = Object.freeze([
		"altKey",
		"button",
		"buttons",
		"clientX",
		"clientY",
		"code",
		"ctrlKey",
		"deltaX",
		"deltaY",
		"deltaZ",
		"detail",
		"key",
		"metaKey",
		"offsetX",
		"offsetY",
		"shiftKey",
		"target",
		"type"
	]);

	function wrapClosure(thread, closure) {
		if (!closure || closure.type !== "CLOSURE") return closure;
		if (wrappers.has(closure)) return wrappers.get(closure);
		const vm = thread.vm;
		const wrapped = function(...incoming) {
			const innerThread = vm.spawn(closure.code);
			if (!innerThread || innerThread.status === "SUPPRESSED") return undefined;
			innerThread.currentUpvalues = closure.upvalues;
			innerThread.environment = closure.environment || innerThread.environment;
			const args = (closure.boundArgs || []).concat(incoming.map(value => {
				return captureHostValue(vm, value);
			}));
			const boundThis = closure.boundThis !== undefined
				? closure.boundThis
				: captureHostValue(vm, this);
			innerThread.currentScope = {
				arguments: args,
				this: boundThis
			};
			args.forEach((value, index) => {
				innerThread.currentScope[index] = value;
			});
			if (vm.wake) vm.wake();
			return undefined;
		};
		wrapped._merkavaClosure = closure;
		security()?.markCallable(vm, wrapped);
		wrappers.set(closure, wrapped);
		return wrapped;
	}

	function captureHostValue(vm, value) {
		if (!eventLike(value)) {
			security()?.markObject(vm, value);
			return value;
		}
		const copy = Object.create(null);
		for (const key of eventKeys) {
			if (value[key] !== undefined) copy[key] = value[key];
		}
		copy.preventDefault = safeEventMethod(value, "preventDefault");
		copy.stopPropagation = safeEventMethod(value, "stopPropagation");
		security()?.markObject(vm, copy);
		security()?.markObject(vm, copy.target);
		security()?.markCallable(vm, copy.preventDefault);
		security()?.markCallable(vm, copy.stopPropagation);
		return copy;
	}

	function safeEventMethod(event, name) {
		return function() {
			try {
				if (typeof event?.[name] === "function") event[name]();
			} catch {
				return undefined;
			}
			return undefined;
		};
	}

	function eventLike(value) {
		return !!value
			&& typeof value === "object"
			&& (typeof value.type === "string"
				|| typeof value.preventDefault === "function"
				|| typeof value.stopPropagation === "function");
	}

	function security() {
		return root.MerkavaVM.Security;
	}

	root.MerkavaVM.ClosureBridge = {
		captureHostValue,
		wrapClosure
	};
})(typeof self !== "undefined" ? self : this);
