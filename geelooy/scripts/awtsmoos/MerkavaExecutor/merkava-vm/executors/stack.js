//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MerkavaVmStackExecutors
 * @description The Awtsmoos lets every name descend through an ordered vessel,
 * while Awtsmoos.com closes reflective side doors in strict worlds so a `with`
 * scope cannot whisper a forbidden constructor name around the ordinary guards.
 */
(function(root) {
	root.MerkavaVM = root.MerkavaVM || {};
	root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];

	const handlers = root.MerkavaVM.OpHandlers;
	const safeUndefinedGlobals = new Set(["undefined"]);

	handlers[0x10] = thread => thread.pop();
	handlers[0x11] = thread => {
		if (thread.stack.length === 0) {
			throw new Error("[VM Critical] Stack Underflow (DUP)");
		}
		thread.push(thread.peek());
	};
	handlers[0x12] = thread => {
		const first = thread.pop();
		const second = thread.pop();
		thread.push(first);
		thread.push(second);
	};
	handlers[0x1A] = thread => duplicatePair(thread);
	handlers[0x1B] = thread => swapPairs(thread);
	handlers[0x13] = thread => {
		const index = thread.readU16();
		thread.push(index >= 0 && index < thread.constants.length
			? thread.constants[index]
			: undefined);
	};
	handlers[0x14] = thread => thread.push(undefined);
	handlers[0x15] = thread => thread.push(null);
	handlers[0x16] = thread => thread.push(true);
	handlers[0x17] = thread => thread.push(false);
	handlers[0x18] = thread => thread.push(thread.currentScope?.this);
	handlers[0x19] = thread => {
		const type = thread.read8();
		thread.push(type === 0
			? thread.currentScope?.["new.target"]
			: { url: "virtual-module" });
	};
	handlers[0x20] = thread => {
		thread.push(thread.currentScope?.[thread.read8()]);
	};
	handlers[0x21] = thread => {
		thread.currentScope ||= {};
		thread.currentScope[thread.read8()] = thread.pop();
	};
	handlers[0x24] = thread => {
		const index = thread.read8();
		const scope = upvalueScope(thread, thread.read8());
		thread.push(scope?.[index]);
	};
	handlers[0x25] = thread => {
		const index = thread.read8();
		const scope = upvalueScope(thread, thread.read8());
		const value = thread.pop();
		if (scope) scope[index] = value;
	};
	handlers[0x22] = thread => {
		const name = thread.constants[thread.readU16()];
		thread.push(readGlobal(thread, name));
	};
	handlers[0x23] = thread => {
		const name = thread.constants[thread.readU16()];
		storeGlobal(thread, name, thread.pop());
	};

	function readGlobal(thread, name) {
		if (safeUndefinedGlobals.has(name)) return undefined;
		if (name === "exports") return readExports(thread);
		const scoped = readWithStack(thread, name);
		if (scoped.found) return scoped.value;
		if (thread.environment && name in thread.environment) {
			return thread.environment[name];
		}
		if (thread.vm?.memory?.globals
			&& Object.prototype.hasOwnProperty.call(thread.vm.memory.globals, name)) {
			return thread.vm.memory.getGlobal(name);
		}
		if (thread.vm.context && name in thread.vm.context) return thread.vm.context[name];
		throw new ReferenceError(`${String(name)} is not defined`);
	}

	function readExports(thread) {
		return thread.currentScope?.exports
			|| thread.environment?.exports
			|| thread.vm.context?.exports
			|| {};
	}

	function readWithStack(thread, name) {
		for (let index = (thread.withStack?.length || 0) - 1; index >= 0; index -= 1) {
			const scope = thread.withStack[index];
			guardProperty(thread, scope, name);
			if (name in scope) return { found: true, value: prepareProperty(thread, scope, name) };
		}
		return { found: false, value: undefined };
	}

	function storeGlobal(thread, name, value) {
		for (let index = (thread.withStack?.length || 0) - 1; index >= 0; index -= 1) {
			const scope = thread.withStack[index];
			guardProperty(thread, scope, name);
			if (name in scope) {
				scope[name] = value;
				return;
			}
		}
		if (thread.environment) thread.environment[name] = value;
		else thread.vm.memory.setGlobal(name, value);
	}

	function guardProperty(thread, target, key) {
		root.MerkavaVM.Security?.guardProperty(thread, target, key);
	}

	function prepareProperty(thread, target, key) {
		const value = target[key];
		return root.MerkavaVM.Security?.prepareProperty(thread, target, key, value) ?? value;
	}

	function upvalueScope(thread, depth) {
		let scope = thread.currentUpvalues;
		for (let index = 1; index < depth; index += 1) scope = scope?.__parent;
		return scope;
	}

	function duplicatePair(thread) {
		const second = thread.pop();
		const first = thread.pop();
		thread.push(first);
		thread.push(second);
		thread.push(first);
		thread.push(second);
	}

	function swapPairs(thread) {
		const fourth = thread.pop();
		const third = thread.pop();
		const second = thread.pop();
		const first = thread.pop();
		thread.push(third);
		thread.push(fourth);
		thread.push(first);
		thread.push(second);
	}
})(typeof self !== "undefined" ? self : this);
