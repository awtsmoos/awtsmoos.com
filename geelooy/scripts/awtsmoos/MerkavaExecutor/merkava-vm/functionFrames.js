//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MerkavaVmFunctionFrames
 * @description The Awtsmoos folds a function into a measured frame and returns it
 * without tearing the vessel; Awtsmoos.com keeps scope, class, and constructor flow
 * separate from native-call authority so each boundary may glow and know.
 */
(function(root) {
	root.MerkavaVM = root.MerkavaVM || {};

	function createClosure(thread, code, flags) {
		if (thread.currentScope && !thread.currentScope.__parent) {
			thread.currentScope.__parent = thread.currentUpvalues;
		}
		const closure = {
			code,
			environment: thread.environment,
			isArrow: !!(flags & 4),
			isAsync: !!(flags & 1),
			isGenerator: !!(flags & 2),
			prototype: {},
			type: "CLOSURE",
			upvalues: thread.currentScope
		};
		closure.bind = (thisArg, ...args) => ({
			...closure,
			boundArgs: args,
			boundThis: thisArg
		});
		security()?.markObject(thread, closure.prototype);
		return closure;
	}

	function runClosure(thread, closure, args, isNew) {
		const finalArgs = (closure.boundArgs || []).concat(args);
		const instance = isNew ? makeInstance(thread, closure) : null;
		thread.frames.push({
			bytecode: thread.bytecode,
			constants: thread.constants,
			constructingInstance: instance,
			environment: thread.environment,
			ip: thread.ip,
			isConstructor: isNew,
			scope: thread.currentScope,
			stackSize: thread.stack.length,
			upvalues: thread.currentUpvalues
		});
		thread.bytecode = closure.code.bytecode;
		thread.constants = closure.code.constants;
		thread.ip = 0;
		thread.currentScope = {
			arguments: finalArgs,
			this: closureThis(thread, closure, instance, isNew)
		};
		thread.currentUpvalues = closure.upvalues;
		thread.environment = closure.environment || thread.environment;
		finalArgs.forEach((value, index) => {
			thread.currentScope[index] = value;
		});
	}

	function makeClass(thread, constructorValue, superValue) {
		const finalValue = constructorValue || createClosure(thread, {
			bytecode: [0x02],
			constants: []
		}, 0);
		const prototype = superValue
			? Object.create(superValue.prototype || {})
			: {};
		prototype.constructor = finalValue;
		finalValue.prototype = prototype;
		security()?.markObject(thread, prototype);
		return finalValue;
	}

	function closureThis(thread, closure, instance, isNew) {
		if (isNew) return instance;
		if (closure.isArrow) return closure.upvalues?.this;
		if (closure.boundThis !== undefined) return closure.boundThis;
		return thread.environment;
	}

	function makeInstance(thread, closure) {
		const instance = Object.create(closure.prototype || {});
		security()?.markObject(thread, instance);
		return instance;
	}

	function security() {
		return root.MerkavaVM.Security;
	}

	root.MerkavaVM.FunctionFrames = {
		createClosure,
		makeClass,
		runClosure
	};
})(typeof self !== "undefined" ? self : this);
