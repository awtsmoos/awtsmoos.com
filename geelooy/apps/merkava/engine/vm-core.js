var self = globalThis;

// B"H
/**
 * @file merkava-opcodes.js
 * @version 2.4.1 - Divine Pairs
 */

(function(root, factory) {
    // B"H - Robust Global Resolution
    let globalScope = root;
    if (typeof globalThis !== 'undefined') globalScope = globalThis;
    else if (typeof self !== 'undefined') globalScope = self;
    else if (typeof window !== 'undefined') globalScope = window;

    const opcodes = factory();
    
    // Explicitly attach to global to prevent module resolution failures
    globalScope.MerkavaOpcodes = opcodes;
    
    if (typeof module === 'object' && module.exports) {
        module.exports = opcodes;
    } else {
        root.MerkavaOpcodes = opcodes;
    }
}(typeof self !== 'undefined' ? self : this, function() {

    const OPCODES = {
        NOP: 0x00,
        HALT: 0x01,
        RETURN: 0x02,
        JUMP: 0x03,
        JUMP_IF_FALSE: 0x04,
        JUMP_IF_TRUE: 0x05,
        
        // Stack Manips
        POP: 0x10,
        DUP: 0x11,
        SWAP: 0x12,
        PUSH_CONST: 0x13,
        PUSH_UNDEFINED: 0x14,
        PUSH_NULL: 0x15,
        PUSH_TRUE: 0x16,
        PUSH_FALSE: 0x17,
        PUSH_THIS: 0x18,
        PUSH_META: 0x19,
        DUP2: 0x1A,    // New: DUP top 2
        SWAP2: 0x1B,   // New: SWAP top 2 pairs

        // Variables
        LOAD_LOCAL: 0x20,
        STORE_LOCAL: 0x21,
        LOAD_GLOBAL: 0x22,
        STORE_GLOBAL: 0x23,
        LOAD_UPVALUE: 0x24,
        STORE_UPVALUE: 0x25,

        // Objects & Arrays
        ALLOC_OBJECT: 0x30,
        ALLOC_ARRAY: 0x31,
        GET_PROP: 0x32,
        SET_PROP: 0x33,
        DELETE_PROP: 0x34,
        
        // Math & Logic
        ADD: 0x40, SUB: 0x41, MUL: 0x42, DIV: 0x43, MOD: 0x44, POW: 0x45,
        BIT_AND: 0x46, BIT_OR: 0x47, BIT_XOR: 0x48, SHL: 0x49, SHR: 0x4A, USHR: 0x4B,
        
        // Comparison
        EQ: 0x4C, NEQ: 0x4D, STRICT_EQ: 0x4E, STRICT_NEQ: 0x4F,
        GT: 0x50, GTE: 0x51, LT: 0x52, LTE: 0x53,
        INSTANCEOF: 0x54, IN: 0x55,

        // Unary
        NOT: 0x60, BIT_NOT: 0x61, NEGATE: 0x62, TYPEOF: 0x63, VOID: 0x64,

        // Functions & Classes
        CLOSURE: 0x70,
        CALL: 0x71,
        NEW: 0x72,
        MAKE_CLASS: 0x73, 
        GET_SUPER: 0x74,

        // Async & Generators
        AWAIT: 0x80,
        YIELD: 0x81,
        YIELD_STAR: 0x82,

        // System
        SYSCALL: 0x90,
        THROW: 0x91,
        ENTER_TRY: 0x92,
        EXIT_TRY: 0x93,
        DEBUGGER: 0x94,
        IMPORT: 0x95,
        IMPORT_MODULE: 0x96, 

        // Iteration & Control
        GET_ITERATOR: 0xA0,
        ITERATOR_NEXT: 0xA1,
        ITERATOR_DONE: 0xA2,
        ITERATOR_VALUE: 0xA3,
        
        // Advanced
        ENUMERATE: 0xA4,
        CHAIN_CHECK: 0xA5,
        WITH_ENTER: 0xA6,
        WITH_EXIT: 0xA7,
        
        // Spread Support
        ARRAY_PUSH: 0xB3,
        ARRAY_SPREAD: 0xB4,
        OBJECT_MERGE: 0xB5,
        OBJECT_REST: 0xB6
    };

    // B"H - Freeze to prevent accidental mutation or corruption
    Object.freeze(OPCODES);

    const OPCODE_NAMES = Object.fromEntries(
        Object.entries(OPCODES).map(([k, v]) => [v, k])
    );

    const VM_THREAD_STATUS = {
        RUNNING: 0,
        COMPLETED: 1,
        CRASHED: 2,
        YIELDED: 3,
        AWAITING: 4,
        SUSPENDED: 5
    };

    return {
        OPCODES,
        OPCODE_NAMES,
        VM_THREAD_STATUS,
        getOpName: (op) => OPCODE_NAMES[op] || `UNKNOWN(0x${op.toString(16)})`
    };
}));

// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // --- CONTROL FLOW ---
    H[0x00] = (t) => {}; // NOP
    H[0x0a] = (t) => {}; // Crumple Zone
    H[0x01] = (t) => 'HALT';

    // B"H 2026-10-09: FIXED off-by-2 in JUMP. `t.ip += t.read16()` reads t.ip
    // BEFORE read16() advances it (JS evaluates LHS base before RHS), landing
    // 2 bytes early. Read offset first, then add.
    H[0x03] = (t) => { const off = t.read16(); t.ip += off; }; // JUMP
    H[0x04] = (t) => { const off = t.read16(); if (!t.pop()) t.ip += off; }; // JUMP_IF_FALSE
    H[0x05] = (t) => { const off = t.read16(); if (t.pop()) t.ip += off; }; // JUMP_IF_TRUE

    H[0x02] = (t) => { // RETURN
        const retVal = t.pop();

        if (t.frames.length > 0) {
            const frame = t.frames.pop();
            // B"H 2026-10-09: a return inside try abandons the try — drop its
            // catch contexts so a later throw can't land in a dead frame.
            if (frame.catchDepth !== undefined && t.catchStack.length > frame.catchDepth) {
                t.catchStack.length = frame.catchDepth;
            }
            t.ip = frame.ip; t.bytecode = frame.bytecode; t.constants = frame.constants;
            t.currentScope = frame.scope; t.currentUpvalues = frame.upvalues; t.environment = frame.environment;

            let actualRet = retVal;
            if (frame.isConstructor) {
                 if (!retVal || (typeof retVal !== 'object' && typeof retVal !== 'function')) {
                     actualRet = frame.constructingInstance || frame.scope['this'];
                 }
            }

            // B"H (2026-10-09): use _sp (was stack.length, now capacity not size)
            while (t._sp > frame.stackSize) t.pop();
            t.push(actualRet);
        } else {
            t.push(retVal); t.status = 'COMPLETED'; return 'COMPLETED';
        }
    };

    // --- ASYNC & SYSTEM ---
    H[0x80] = (t) => { // AWAIT
        const p = t.pop();
        if (p && typeof p.then === 'function') {
            t.status = 'AWAITING';
            p.then(
                v => { t.push(v); t.status = 'RUNNING'; if(t.vm.wake) t.vm.wake(); },
                e => { console.error("[VM] Await Error:", e); t.push(undefined); t.status = 'RUNNING'; if(t.vm.wake) t.vm.wake(); }
            );
        } else t.push(p);
    };

    H[0x90] = (t) => { // SYSCALL
        const id = t.read8(), argc = t.read8();
        // B"H: JSON.parse/stringify fast path (SYS 50/51, see executors/json.js).
        if ((id === 50 || id === 51) && root.MerkavaVM.jsonCall) {
            root.MerkavaVM.jsonCall(t, id === 50 ? 0 : 1, argc);
            return;
        }
        // B"H: indexed fill O(n) (was unshift loop O(n^2)).
        const args = new Array(argc);
        for (let i = argc - 1; i >= 0; i--) args[i] = t.pop();
        t.push(t.vm.hostAPI[id] ? t.vm.hostAPI[id](...args) : undefined);
    };

    H[0x91] = (t) => { throw t.pop(); }; // THROW

    // B"H 2026-10-09: ENTER_TRY saves the FULL execution context, not just the
    // catch address. On catch, the thread unwinds frames pushed after the try,
    // restores bytecode/constants/scope, and resets the stack — so a throw
    // across call frames lands in the right function with a clean stack.
    // Entry: [catchAddr, sp, frameDepth, bytecode, constants, scope, upvalues, env].
    // Lean: one small array per ACTIVE try only; EXIT_TRY drops it.
    H[0x92] = (t) => { const off = t.read16(); t.catchStack.push([t.ip + off, t._sp, t.frames.length, t.bytecode, t.constants, t.currentScope, t.currentUpvalues, t.environment]); }; // ENTER_TRY
    H[0x93] = (t) => t.catchStack.pop(); // EXIT_TRY

    H[0x95] = (t) => { t.pop(); t.push(Promise.resolve({})); }; // IMPORT (Dynamic import placeholder)

    H[0x96] = (t) => { // IMPORT_MODULE (ES Module Resolution)
        const specifier = t.pop();
        if (t.vm.importModule) {
            t.push(t.vm.importModule(specifier));
        } else {
            console.warn("[VM] importModule bridge not found.");
            t.push(Promise.resolve({}));
        }
    };

    // --- ADVANCED FLOW ---
    H[0xA0] = (t) => { // GET_ITERATOR
        const v = t.pop();
        if (v && typeof v[Symbol.iterator] === 'function') t.push(v[Symbol.iterator]());
        else throw new TypeError("Not iterable");
    };
    H[0xA1] = (t) => t.push(t.peek().next()); // NEXT
    H[0xA2] = (t) => t.push(t.peek().done);   // DONE
    H[0xA3] = (t) => { const res = t.peek(); t.pop(); t.push(res.value); }; // VALUE

    H[0xA5] = (t) => { // CHAIN_CHECK
        const off = t.read16(), val = t.peek();
        if (val == null) { t.pop(); t.push(undefined); t.ip += off; }
    };
})(typeof self !== 'undefined' ? self : this);

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
	// B"H (2026-10-09): direct _sp (was push()/peek() method calls).
	handlers[0x11] = thread => {
		const sp = thread._sp;
		if (sp === 0) {
			throw new Error("[VM Critical] Stack Underflow (DUP)");
		}
		if (sp >= thread.stack.length) thread._growStack();
		thread.stack[sp] = thread.stack[sp - 1];
		thread._sp = sp + 1;
	};
	handlers[0x12] = thread => {
		const first = thread.pop();
		const second = thread.pop();
		thread.push(first);
		thread.push(second);
	};
	handlers[0x1A] = thread => duplicatePair(thread);
	handlers[0x1B] = thread => swapPairs(thread);
	// B"H (2026-10-09): direct _sp (was push() method call).
	handlers[0x13] = thread => {
		const index = thread.readU16();
		const sp = thread._sp;
		if (sp >= thread.stack.length) thread._growStack();
		thread.stack[sp] = index >= 0 && index < thread.constants.length
			? thread.constants[index]
			: undefined;
		thread._sp = sp + 1;
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

// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // B"H (2026-10-09): Hot-path optimization. Binary ops use direct _sp
    // access instead of pop()/push() method calls. This is the hottest
    // path in arithmetic-heavy code (loops).
    //
    // Stack layout for binary op: [..., a, b] with _sp pointing past b.
    // We replace both with result: stack[_sp-2] = a OP b; _sp--.

    H[0x40] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a + b; t._sp = sp - 1; }; // ADD
    H[0x41] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a - b; t._sp = sp - 1; }; // SUB
    H[0x42] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a * b; t._sp = sp - 1; }; // MUL
    H[0x43] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a / b; t._sp = sp - 1; }; // DIV
    H[0x44] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a % b; t._sp = sp - 1; }; // MOD
    H[0x45] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = Math.pow(a, b); t._sp = sp - 1; }; // POW

    // --- BITWISE ---
    H[0x46] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a & b; t._sp = sp - 1; }; // AND
    H[0x47] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a | b; t._sp = sp - 1; }; // OR
    H[0x48] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a ^ b; t._sp = sp - 1; }; // XOR
    H[0x49] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a << b; t._sp = sp - 1; }; // SHL
    H[0x4A] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a >> b; t._sp = sp - 1; }; // SHR
    H[0x4B] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a >>> b; t._sp = sp - 1; }; // USHR

    // --- COMPARISON ---
    H[0x4C] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a == b; t._sp = sp - 1; }; // EQ
    H[0x4E] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a === b; t._sp = sp - 1; }; // STRICT EQ
    H[0x4D] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a != b; t._sp = sp - 1; }; // NEQ
    H[0x4F] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a !== b; t._sp = sp - 1; }; // STRICT NEQ
    H[0x50] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a > b; t._sp = sp - 1; };  // GT
    H[0x51] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a >= b; t._sp = sp - 1; }; // GTE
    H[0x52] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a < b; t._sp = sp - 1; };  // LT
    H[0x53] = (t) => { const s = t.stack, sp = t._sp; const b = s[sp-1], a = s[sp-2]; s[sp-2] = a <= b; t._sp = sp - 1; }; // LTE

    H[0x54] = (t) => { const b = t.pop(), a = t.pop(); t.push(a instanceof b); }; // INSTANCEOF
    H[0x55] = (t) => { const b = t.pop(), a = t.pop(); t.push(a in b); }; // IN

    // --- UNARY ---
    H[0x60] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = !s[sp-1]; }; // NOT (in-place)
    H[0x61] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = ~s[sp-1]; }; // BIT NOT (in-place)
    H[0x62] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = -s[sp-1]; }; // NEGATE (in-place)
    H[0x63] = (t) => { const s = t.stack, sp = t._sp; s[sp-1] = typeof s[sp-1]; }; // TYPEOF (in-place)
    H[0x64] = (t) => { t._sp--; }; // VOID (just pop, in-place)

})(typeof self !== 'undefined' ? self : this);

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

	// B"H (2026-10-09): threadStrict() reads the flag cached on the Thread at
	// construction. Falls back to the full security lookup only for exotic
	// thread-likes that lack the cached flag. Was: a global lookup plus
	// policy() walk on EVERY property access.
	function threadStrict(thread) {
		const s = thread._strict;
		return s === undefined ? security()?.isStrict(thread) === true : s;
	}

	function getProperty(thread) {
		const key = thread.pop();
		const target = thread.pop();
		if (target == null) {
			console.warn(`[VM] GET_PROP '${String(key)}' on null/undefined.`);
			thread.push(undefined);
			return;
		}
		if (threadStrict(thread)) {
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
		const strict = threadStrict(thread);
		if (strict) security()?.guardProperty(thread, target, key);
		const assigned = eventClosure(thread, key, value);
		if (!strict && legacyStyleTarget(target)) {
			target.setProperty ? target.setProperty(key, String(assigned)) : target[key] = assigned;
		} else {
			target[key] = assigned;
		}
		thread.push(value);
	}

	function deleteProperty(thread) {
		const key = thread.pop();
		const target = thread.pop();
		if (threadStrict(thread)) security()?.guardProperty(thread, target, key);
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
		if (!threadStrict(thread)) {
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
				rest[key] = threadStrict(thread)
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
		/* B"H 2026-10-09: ClosureBridge removed — it broke per-iteration let
		 * capture semantics (returned 1000 instead of 999, mismatching V8).
		 * Event closures pass through unwrapped; capture is handled by the
		 * VM's scope chain directly. */
		return value;
	}

	// B"H (2026-10-09): cache of native-function detection. The old code ran
	// Function.prototype.toString() — which materializes the FULL source text
	// — on EVERY function-valued property load. One WeakMap entry per distinct
	// function; entries vanish with the function (no leak, minimal RAM).
	const nativeFnCache = new WeakMap();

	function legacyProperty(target, key) {
		let value = target[key];
		// B"H: direct comparisons — was a fresh 3-element array + includes()
		// allocated on every undefined-valued load.
		if (value === undefined && typeof key === "string"
			&& (key === "values" || key === "keys" || key === "entries")
			&& typeof self !== "undefined" && self.Object) {
			value = self.Object[key];
		}
		if (typeof value === "function" && !value._merkavaClosure) {
			let isNative = nativeFnCache.get(value);
			if (isNative === undefined) {
				try {
					isNative = value.toString().includes("[native code]") && !value.name.startsWith("bound ");
				} catch {
					return value;
				}
				nativeFnCache.set(value, isNative);
			}
			if (isNative) {
				try {
					value = value.bind(target);
				} catch {
					// fall through with the unbound value, as before
				}
			}
		}
		return value;
	}

	// B"H (2026-10-09): hoisted — was a typeof global lookup on every store.
	const HAS_CSS_STYLE_DECL = typeof CSSStyleDeclaration !== "undefined";
	function legacyStyleTarget(target) {
		return HAS_CSS_STYLE_DECL && target instanceof CSSStyleDeclaration;
	}

	function markObject(thread, value) {
		return security()?.markObject(thread, value) || value;
	}

	function security() {
		return root.MerkavaVM.Security;
	}
})(typeof self !== "undefined" ? self : this);

// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.OpHandlers = root.MerkavaVM.OpHandlers || [];
    const H = root.MerkavaVM.OpHandlers;

    // B"H (2026-10-09): hoisted — was recomputed on every host call.
    const GLOBAL_OBJ = typeof globalThis !== 'undefined' ? globalThis
        : (typeof self !== 'undefined' ? self : this);

    const wrapForHost = (t, v) => {
        if (!v || typeof v !== 'object') return v;
        if (v.__kind === 'function' && typeof v.call === 'function') {
            // B"H: host-lowered VM function (DefaultMerkavaHost.makeFunction).
            // Bridge V8-side calls back into the host interpreter.
            const fn = v;
            return (...inner) => fn.call(inner);
        }
        if (v.type === 'CLOSURE') {
            const wrapped = function(...inner) {
                const safeInner = inner.map(captureEvent);
                const nt = t.vm.spawn(v.code);
                nt.currentUpvalues = v.upvalues;
                nt.environment = v.environment || nt.environment;
                const fArgs = (v.boundArgs || []).concat(safeInner);
                nt.currentScope = { 'this': this, 'arguments': fArgs };
                for (let k = 0; k < fArgs.length; k++) nt.currentScope[k] = fArgs[k];
                if (t.vm.wake) t.vm.wake();
            };
            wrapped._merkavaClosure = v;
            return wrapped;
        }
        return v;
    };

    // B"H: shared with executors/json.js (JSON.parse/stringify fast path).
    root.MerkavaVM.wrapForHost = wrapForHost;

    H[0x70] = (t) => { // CLOSURE
        const code = t.constants[t.readU16()], flags = t.read8();
        if (t.currentScope && !t.currentScope.__parent) t.currentScope.__parent = t.currentUpvalues;
        const cls = {
            type: 'CLOSURE', code,
            isAsync: !!(flags & 1), isGenerator: !!(flags & 2), isArrow: !!(flags & 4),
            upvalues: t.currentScope, environment: t.environment, prototype: {}
        };
        cls.bind = (thisArg, ...args) => ({ ...cls, boundThis: thisArg, boundArgs: args });
        t.push(cls);
    };

    const runClosure = (t, callee, args, isNew) => {
        // B"H (2026-10-09): skip concat alloc when there are no bound args.
        const finalArgs = callee.boundArgs ? callee.boundArgs.concat(args) : args;
        t.frames.push({
            ip: t.ip, bytecode: t.bytecode, constants: t.constants,
            scope: t.currentScope, upvalues: t.currentUpvalues, stackSize: t._sp,
            environment: t.environment, isConstructor: isNew,
            constructingInstance: isNew ? Object.create(callee.prototype || {}) : null,
            // B"H 2026-10-09: try-contexts opened inside the callee die with it.
            catchDepth: t.catchStack.length
        });

        t.bytecode = callee.code.bytecode;
        t.constants = callee.code.constants;
        t.ip = 0;

        const scopeThis = isNew
            ? t.frames[t.frames.length-1].constructingInstance
            : (callee.isArrow ? (callee.upvalues ? callee.upvalues['this'] : undefined) : (callee.boundThis !== undefined ? callee.boundThis : t.environment));

        t.currentScope = { 'this': scopeThis, 'arguments': finalArgs };
        t.currentUpvalues = callee.upvalues;
        t.environment = callee.environment || t.environment;
        // B"H (2026-10-09): plain for loop (was forEach closure alloc per call).
        for (let i = 0; i < finalArgs.length; i++) t.currentScope[i] = finalArgs[i];
    };

    const captureEvent = (e) => {
        if (!e || !(e instanceof Event || (e.constructor && e.constructor.name.includes('Event')))) return e;
        const copy = {};
        const props = [
            'key', 'code', 'clientX', 'clientY', 'offsetX', 'offsetY',
            'target', 'type', 'button', 'buttons', 'shiftKey', 'ctrlKey',
            'altKey', 'metaKey', 'detail', 'deltaX', 'deltaY', 'deltaZ'
        ];
        props.forEach(k => { if (e[k] !== undefined) copy[k] = e[k]; });
        copy.preventDefault = () => { try { e.preventDefault(); } catch(err) {} };
        copy.stopPropagation = () => { try { e.stopPropagation(); } catch(err) {} };
        return copy;
    };

    H[0x71] = (t) => { // CALL
        const count = t.read8();
        // B"H (2026-10-09): indexed fill O(n) (was unshift loop O(n^2)).
        const args = new Array(count);
        for (let i = count - 1; i >= 0; i--) args[i] = t.pop();
        let callee = t.pop(), ctx = t.pop() || t.environment;

        if (typeof callee === 'function' && callee._merkavaClosure) callee = callee._merkavaClosure;

        if (callee && callee.type === 'CLOSURE') {
            if (callee.boundThis === undefined && !callee.isArrow) callee.boundThis = ctx;
            runClosure(t, callee, args, false);
        } else if (typeof callee === 'function') {
            // B"H (2026-10-09): wrap in place (was args.map alloc); the old
            // per-call WeakMap never hit (fresh each call) — removed.
            for (let i = 0; i < args.length; i++) args[i] = wrapForHost(t, args[i]);

            try {
                const safeCtx = (ctx === undefined || ctx === null) ? GLOBAL_OBJ : ctx;
                t.push(callee.apply(safeCtx, args));
            } catch(e) {
                console.error("[VM] Native Call Error:", e);
                throw e;
            }
        } else {
            throw new TypeError(`[VM] Call Error: ${typeof callee} is not a function.`);
        }
    };

    H[0x72] = (t) => { // NEW
        const count = t.read8();
        // B"H (2026-10-09): indexed fill O(n) (was unshift loop O(n^2)).
        const args = new Array(count);
        for (let i = count - 1; i >= 0; i--) args[i] = t.pop();
        let callee = t.pop();
        if (typeof callee === 'function' && callee._merkavaClosure) callee = callee._merkavaClosure;
        if (callee && callee.type === 'CLOSURE') runClosure(t, callee, args, true);
        else if (typeof callee === 'function') t.push(new callee(...args));
        else throw new TypeError(`[VM] New Error: ${typeof callee} is not a constructor`);
    };

    H[0x73] = (t) => { // MAKE_CLASS
        t.readU16();
        const ctor = t.pop(), sup = t.pop();
        let final = ctor || { type: 'CLOSURE', code: { bytecode: [0x02], constants: [] }, upvalues: t.currentScope, prototype: {} };
        if (sup) {
            final.prototype = Object.create(sup.prototype || {});
            final.prototype.constructor = final;
        } else {
            final.prototype = { constructor: final };
        }
        t.push(final);
    };
})(typeof self !== 'undefined' ? self : this);

// B"H
// Boruch Hashem

/**
 * @module MerkavaVmJsonExecutors
 * @description Dedicated fast path for JSON.parse / JSON.stringify.
 *
 * The compiler (MerkavaJsonCompiler) emits SYS.jsonParse (50) / SYS.jsonStringify (51)
 * for `JSON.parse(x)` / `JSON.stringify(x)` calls instead of the generic callMethod
 * syscall. This handler pops the receiver and args directly off the stack — no
 * arg array, no spread, no per-arg closure allocation — and invokes the host
 * JSON natively.
 *
 * Correctness: a runtime identity check against the VM's captured host JSON
 * (see MerkavaVM constructor) keeps shadowing exact. If the loaded JSON object
 * is not the host JSON (parameter shadow, global reassignment, with-scope),
 * it falls back to generic method-call semantics with the right receiver.
 *
 * Stack on entry: [jsonObj, arg0, arg1, ...]  (argc = 1 + argCount)
 */
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    function wrapArg(t, v) {
        const w = root.MerkavaVM.wrapForHost;
        return w ? w(t, v) : v;
    }

    // which: 0 = parse, 1 = stringify
    function jsonCall(t, which, argc) {
        const n = argc - 1;
        let a0, a1, a2;
        if (n > 2) a2 = t.pop();
        if (n > 1) a1 = t.pop();
        if (n > 0) a0 = t.pop();
        const jsonObj = t.pop();
        const vm = t.vm;
        const w0 = wrapArg(t, a0);
        const w1 = n > 1 ? wrapArg(t, a1) : undefined;
        const w2 = n > 2 ? wrapArg(t, a2) : undefined;
        if (vm && jsonObj === vm._hostJSON) {
            if (which === 0) {
                t.push(n > 1 ? vm._hostJSONParse(w0, w1) : vm._hostJSONParse(w0));
            } else {
                t.push(n > 2 ? vm._hostJSONStringify(w0, w1, w2)
                    : n > 1 ? vm._hostJSONStringify(w0, w1)
                    : vm._hostJSONStringify(w0));
            }
            return;
        }
        // Slow path: shadowed or replaced JSON — exact generic semantics.
        // Accepts native functions and host-lowered VM functions (__kind).
        const m = jsonObj == null ? undefined : (which === 0 ? jsonObj.parse : jsonObj.stringify);
        const fn = (typeof m === 'function') ? (...a) => m.apply(jsonObj, a)
            : (m && m.__kind === 'function' && typeof m.call === 'function') ? (...a) => m.call(a, jsonObj)
            : null;
        if (!fn) {
            throw new TypeError('[VM] JSON method is not a function');
        }
        t.push(n > 2 ? fn(w0, w1, w2)
            : n > 1 ? fn(w0, w1)
            : n > 0 ? fn(w0)
            : fn());
    }

    root.MerkavaVM.jsonCall = jsonCall;
})(typeof self !== 'undefined' ? self : this);


// B"H
(function(root) {
    root.MerkavaExecutor = {
        exec(op, thread) {
            const handlers = root.MerkavaVM.OpHandlers;
            
            if (!handlers) {
                console.error("[VM Critical] OpHandlers table is missing! Check module loading order.");
                return 'CRASHED';
            }

            // Dispatch to registered handler
            if (handlers[op]) {
                const result = handlers[op](thread);
                if (result) return result; // Return flow signals (e.g. HALT)
                return;
            }

            // Fallback for NOP or Unknown
            if (op === 0x00) return;
            
            console.error(`[VM] Unknown Opcode: 0x${op.toString(16)}`);
            return 'UNKNOWN_OP';
        }
    };
    
    root.MerkavaVM = root.MerkavaVM || {};
    root.MerkavaVM.Executor = root.MerkavaExecutor;
    
    console.log("[MerkavaVM] Dispatcher Installed (Modular V7 - Debug).");
})(typeof self !== 'undefined' ? self : this);

// B"H
(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    /**
     * B"H
     * Chapter 104: when the vessel shatters, it keeps the shard.
     *
     * OPTIMIZED (2026-10-09): Fast dispatch path.
     * - OpHandlers cached on thread at construction (was: global lookup per instruction)
     * - Stack uses preallocated array + _sp pointer (was: JS array push/pop method calls)
     * - Bytecode reads inlined in step() (was: read8()/read16() method calls)
     * - Direct handler invocation (was: executor.exec() indirection)
     */
    class Thread {
        constructor(vm, codeObject, context = {}) {
            this.id = Math.floor(Math.random() * 100000);
            this.vm = vm;
            this.bytecode = codeObject.bytecode;
            this.constants = codeObject.constants || [];
            this.ip = 0;
            // B"H: Preallocated stack with manual pointer. Eliminates Array.push/pop
            // method call overhead and growth reallocations in the hot path.
            // B"H (RAM): start at 64 slots (was 256); _growStack doubles
            // on demand. Saves ~1.5KB per thread; threads are numerous
            // and short-lived.
            this.stack = new Array(64);
            this._sp = 0;
            this.status = 'READY';
            this.frames = [];
            this.currentScope = { 'this': context };
            this.environment = context;
            this.catchStack = [];
            this.lastError = null;
            // B"H (2026-10-09): cache the strict-mode flag once. The old code
            // walked root.MerkavaVM.Security -> policy() -> vm.securityPolicy
            // on EVERY property get/set. securityPolicy is fixed at VM build
            // time and never mutated afterwards (verified: no setters exist).
            this._strict = !!(vm && vm.securityPolicy && vm.securityPolicy.strict === true);
            // B"H: Cache the handler table once. The old code did
            // `root.MerkavaExecutor || ...` on EVERY instruction.
            this._handlers = null;
        }

        _getHandlers() {
            if (!this._handlers) {
                this._handlers = root.MerkavaVM.OpHandlers
                    || (root.MerkavaExecutor && root.MerkavaExecutor.OpHandlers);
            }
            return this._handlers;
        }

        _growStack() {
            const grown = new Array(this.stack.length * 2);
            for (let i = 0; i < this._sp; i++) grown[i] = this.stack[i];
            this.stack = grown;
        }

        // B"H 2026-10-09: restores a try-context saved by ENTER_TRY after a
        // throw. Unwinds call frames opened after the try, restores that
        // frame's bytecode/constants/scope, and resets the operand stack —
        // so a throw across call frames lands in the right function with a
        // clean stack. Returns the error value to push for the catch block.
        _unwindToCatch(entry, error) {
            while (this.frames.length > entry[2]) this.frames.pop();
            this.ip = entry[0];
            this._sp = entry[1];
            this.bytecode = entry[3];
            this.constants = entry[4];
            this.currentScope = entry[5];
            this.currentUpvalues = entry[6];
            this.environment = entry[7];
            return error && error.vmValue !== undefined ? error.vmValue
                : error && error.message !== undefined ? error.message
                : error;
        }

        // Public API (used by executors and host code)
        push(val) {
            if (this._sp >= this.stack.length) this._growStack();
            this.stack[this._sp++] = val;
        }
        pop() {
            if (this._sp <= 0) return undefined;
            const val = this.stack[--this._sp];
            this.stack[this._sp] = undefined; // help GC
            return val;
        }
        peek() { return this._sp > 0 ? this.stack[this._sp - 1] : undefined; }

        read8() {
            if (this.ip >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            return this.bytecode[this.ip++];
        }

        read16() {
            if (this.ip + 1 >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            const low = this.bytecode[this.ip++];
            const high = this.bytecode[this.ip++];
            let val = (high << 8) | low;
            if (val >= 0x8000) val -= 0x10000;
            return val;
        }

        readU16() {
            if (this.ip + 1 >= this.bytecode.length) { this.status = 'COMPLETED'; return 0; }
            const low = this.bytecode[this.ip++];
            const high = this.bytecode[this.ip++];
            return (high << 8) | low;
        }

        findName(bytecode) {
            if (!this.environment) return 'anonymous';
            try {
                for (const key of Object.keys(this.environment)) {
                    const value = this.environment[key];
                    if (value && value.type === 'CLOSURE' && value.code && value.code.bytecode === bytecode) return key;
                }
            } catch (_) {}
            return 'anonymous';
        }

        getDivineTrace() {
            const lines = [];
            lines.push(`[Divine Trace] Thread #${this.id} - Status: ${this.status}`);
            lines.push(`  at ${this.findName(this.bytecode)} (IP: ${this.ip}, Bytecode: ${this.bytecode.length} bytes)`);
            for (let index = this.frames.length - 1; index >= 0; index -= 1) {
                const frame = this.frames[index];
                lines.push(`  at ${this.findName(frame.bytecode)} (IP: ${frame.ip}, Bytecode: ${frame.bytecode.length} bytes)`);
            }
            return lines;
        }

        stackSummary() {
            const out = [];
            for (let i = 0; i < 15 && i < this._sp; i++) {
                const value = this.stack[this._sp - 1 - i];
                out.push({
                    slot: `TOP - ${i}`,
                    type: typeof value,
                    value: value && value.type === 'CLOSURE' ? `[Closure: ${value.code.bytecode.length} bytes]` : value
                });
            }
            return out;
        }

        rememberCrash(error) {
            const message = error?.message || String(error);
            this.lastError = {
                message,
                name: error?.name || 'Error',
                stack: error?.stack || '',
                ip: this.ip,
                bytecodeLength: this.bytecode.length,
                threadId: this.id,
                status: this.status,
                trace: this.getDivineTrace(),
                stackSummary: this.stackSummary()
            };
            return this.lastError;
        }

        logCrash(error) {
            const remembered = this.rememberCrash(error);
            console.group('%cB"H - THE VESSELS HAVE SHATTERED', 'color: #ff6b6b; font-weight: bold; font-size: 1.2rem;');
            console.error('Error Soul:', remembered.message);
            remembered.trace.forEach(line => console.log(line));
            console.log('%c[The Stack of Creation]', 'color: #66fcf1; font-weight: bold;');
            console.table(remembered.stackSummary);
            console.groupEnd();
        }

        step() {
            if (this.status !== 'RUNNING') return false;
            // B"H: Fast path — hoist everything into locals to avoid property
            // lookups in the hot loop. Single bounds check per instruction.
            const bc = this.bytecode;
            const bcLen = bc.length;
            let ip = this.ip;
            if (ip >= bcLen) {
                this.status = 'COMPLETED';
                return false;
            }
            const handlers = this._getHandlers();
            if (!handlers) {
                this.status = 'CRASHED';
                throw new Error('[VM Critical] Executor missing from the Palace.');
            }
            const op = bc[ip++];
            this.ip = ip;
            try {
                // B"H: JSON.parse/stringify fast path (SYS 50/51) — skip the
                // handler-table dispatch; jsonCall does the work directly.
                // Falls through to the normal handler on any miss.
                if (op === 0x90 && ip + 1 < bcLen) {
                    const sid = bc[ip], sargc = bc[ip + 1];
                    const svm = this.vm, shj = svm ? svm._hostJSON : null;
                    const sjc = root.MerkavaVM.jsonCall;
                    if ((sid === 50 || sid === 51) && shj && sjc && sargc >= 1 && sargc <= 4 &&
                        this._sp >= sargc && this.stack[this._sp - sargc] === shj) {
                        this.ip = ip + 2;
                        sjc(this, sid === 50 ? 0 : 1, sargc);
                        return true;
                    }
                }
                const handler = handlers[op];
                let result;
                if (handler) {
                    result = handler(this);
                } else if (op === 0x00) {
                    result = undefined; // NOP
                } else {
                    this.status = 'CRASHED';
                    this.rememberCrash(new Error(`Unknown opcode 0x${op.toString(16)} at IP ${ip - 1}`));
                    return false;
                }
                if (result === 'HALT' || result === 'COMPLETED') {
                    this.status = 'COMPLETED';
                    return false;
                }
                if (result === 'UNKNOWN_OP') {
                    this.status = 'CRASHED';
                    this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`));
                    return false;
                }
            } catch (error) {
                if (this.catchStack && this.catchStack.length > 0) {
                    this.push(this._unwindToCatch(this.catchStack.pop(), error));
                    return true;
                }
                this.status = 'CRASHED';
                this.logCrash(error);
                return false;
            }
            return true;
        }

        /**
         * B"H (2026-10-09): Inline-threaded batch runner. The hottest opcodes
         * execute directly on hoisted locals (ip/bc/constants/stack/sp) with
         * zero handler-call overhead and zero per-instruction property
         * traffic. Cold/complex opcodes sync state and fall through to the
         * handler table; frame switches (CALL/RETURN) re-sync bc/constants/
         * stack/env afterwards. Every inline fast path is bit-identical to
         * its handler in executors/*.js (see notes per opcode). try/catch
         * semantics, catchStack, and HALT/COMPLETED/UNKNOWN_OP signals are
         * preserved exactly.
         */
        run(maxSteps) {
            if (this.status !== 'RUNNING') return 0;
            const handlers = this._getHandlers();
            if (!handlers) {
                this.status = 'CRASHED';
                throw new Error('[VM Critical] Executor missing from the Palace.');
            }
            // B"H: hoist hot state into locals. this.ip/this._sp are the
            // authoritative copies; locals are synced before every cold
            // handler call, every catch, and every loop exit.
            let steps = 0;
            let ip = this.ip;
            let bc = this.bytecode;
            let bcLen = bc.length;
            let constants = this.constants;
            let stack = this.stack;
            let sp = this._sp;
            let env = this.environment;
            const vm = this.vm;
            const mem = vm ? vm.memory : null;
            const memGlobals = mem ? mem.globals : undefined;
            const vmCtx = vm ? vm.context : undefined;
            // B"H: when no Security module is installed and the thread is not
            // strict, property fast paths skip guard/prepare calls (they are
            // no-ops without Security). Otherwise fall back to handlers.
            const noSecurity = !root.MerkavaVM.Security && !this._strict;
            const hasSelf = typeof self !== 'undefined';
            const cssStyleDecl = typeof CSSStyleDeclaration !== 'undefined' ? CSSStyleDeclaration : null;
            let coldResult;
            while (steps < maxSteps && this.status === 'RUNNING') {
                if (ip >= bcLen) { this.status = 'COMPLETED'; break; }
                const op = bc[ip++];
                try {
                    // ---- stack primitives (mirrors executors/stack.js) ----
                    if (op === 0x13) { // PUSH_CONST u16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const idx = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = idx < constants.length ? constants[idx] : undefined;
                        steps++; continue;
                    }
                    if (op === 0x11) { // DUP
                        if (sp === 0) throw new Error('[VM Critical] Stack Underflow (DUP)');
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp] = stack[sp - 1]; sp++;
                        steps++; continue;
                    }
                    if (op === 0x10) { // POP (clears slot; no-op on empty — mirrors pop())
                        if (sp > 0) { sp--; stack[sp] = undefined; }
                        steps++; continue;
                    }
                    if (op === 0x12) { // SWAP (underflow: exact pop/pop/push/push via cold path)
                        if (sp >= 2) {
                            const a = stack[sp - 1]; stack[sp - 1] = stack[sp - 2]; stack[sp - 2] = a;
                            steps++; continue;
                        }
                    } else if (op === 0x14) { // PUSH_UNDEFINED
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = undefined;
                        steps++; continue;
                    } else if (op === 0x15) { // PUSH_NULL
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = null;
                        steps++; continue;
                    } else if (op === 0x16) { // PUSH_TRUE
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = true;
                        steps++; continue;
                    } else if (op === 0x17) { // PUSH_FALSE
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = false;
                        steps++; continue;
                    } else if (op === 0x20) { // LOAD_LOCAL u8 (mirrors 0x20: currentScope?.[slot])
                        if (ip >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const slot = bc[ip++];
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        const cs = this.currentScope;
                        stack[sp++] = cs == null ? undefined : cs[slot];
                        steps++; continue;
                    } else if (op === 0x21) { // STORE_LOCAL u8 (mirrors 0x21)
                        if (ip >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const slot = bc[ip++];
                        let cs = this.currentScope;
                        if (!cs) cs = this.currentScope = {};
                        sp--; cs[slot] = stack[sp]; stack[sp] = undefined;
                        steps++; continue;
                    // ---- control flow (mirrors executors/flow.js) ----
                    } else if (op === 0x03) { // JUMP s16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        let off = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        if (off >= 0x8000) off -= 0x10000;
                        ip += off;
                        steps++; continue;
                    } else if (op === 0x04) { // JUMP_IF_FALSE s16 (mirrors pop() truthiness)
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        let off = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        let cond;
                        if (sp > 0) { sp--; cond = stack[sp]; stack[sp] = undefined; }
                        if (!cond) {
                            if (off >= 0x8000) off -= 0x10000;
                            ip += off;
                        }
                        steps++; continue;
                    } else if (op === 0x05) { // JUMP_IF_TRUE s16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        let off = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        let cond;
                        if (sp > 0) { sp--; cond = stack[sp]; stack[sp] = undefined; }
                        if (cond) {
                            if (off >= 0x8000) off -= 0x10000;
                            ip += off;
                        }
                        steps++; continue;
                    } else if (op === 0x01) { // HALT
                        this.ip = ip; this._sp = sp;
                        this.status = 'COMPLETED';
                        break;
                    } else if (op === 0x00 || op === 0x0a) { // NOP / Crumple Zone
                        steps++; continue;
                    // ---- arithmetic (mirrors executors/math.js: no method calls, in-place) ----
                    } else if (op === 0x40) { // ADD
                        stack[sp - 2] = stack[sp - 2] + stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x41) { // SUB
                        stack[sp - 2] = stack[sp - 2] - stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x42) { // MUL
                        stack[sp - 2] = stack[sp - 2] * stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x43) { // DIV
                        stack[sp - 2] = stack[sp - 2] / stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x44) { // MOD
                        stack[sp - 2] = stack[sp - 2] % stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x45) { // POW
                        stack[sp - 2] = Math.pow(stack[sp - 2], stack[sp - 1]); sp--;
                        steps++; continue;
                    } else if (op === 0x46) { // AND
                        stack[sp - 2] = stack[sp - 2] & stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x47) { // OR
                        stack[sp - 2] = stack[sp - 2] | stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x48) { // XOR
                        stack[sp - 2] = stack[sp - 2] ^ stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x49) { // SHL
                        stack[sp - 2] = stack[sp - 2] << stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4a) { // SHR
                        stack[sp - 2] = stack[sp - 2] >> stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4b) { // USHR
                        stack[sp - 2] = stack[sp - 2] >>> stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4c) { // EQ
                        stack[sp - 2] = stack[sp - 2] == stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4d) { // NEQ
                        stack[sp - 2] = stack[sp - 2] != stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4e) { // STRICT EQ
                        stack[sp - 2] = stack[sp - 2] === stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x4f) { // STRICT NEQ
                        stack[sp - 2] = stack[sp - 2] !== stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x50) { // GT
                        stack[sp - 2] = stack[sp - 2] > stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x51) { // GTE
                        stack[sp - 2] = stack[sp - 2] >= stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x52) { // LT
                        stack[sp - 2] = stack[sp - 2] < stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x53) { // LTE
                        stack[sp - 2] = stack[sp - 2] <= stack[sp - 1]; sp--;
                        steps++; continue;
                    } else if (op === 0x60) { // NOT (in-place)
                        stack[sp - 1] = !stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x61) { // BIT NOT (in-place)
                        stack[sp - 1] = ~stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x62) { // NEGATE (in-place)
                        stack[sp - 1] = -stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x63) { // TYPEOF (in-place)
                        stack[sp - 1] = typeof stack[sp - 1];
                        steps++; continue;
                    } else if (op === 0x64) { // VOID (pop, no guard — mirrors t._sp--)
                        sp--;
                        steps++; continue;
                    // ---- globals (mirrors stack.js readGlobal/storeGlobal fast path) ----
                    } else if (op === 0x22) { // LOAD_GLOBAL u16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const idx = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        const name = constants[idx];
                        let v;
                        if (!noSecurity || (this.withStack && this.withStack.length > 0) || name === 'exports') {
                            // B"H: security/with-scope/exports need the full handler.
                            this.ip = ip; this._sp = sp;
                            coldResult = handlers[op](this);
                            ip = this.ip; sp = this._sp;
                            if (this.bytecode !== bc) { bc = this.bytecode; bcLen = bc.length; constants = this.constants; }
                            if (this.stack !== stack) stack = this.stack;
                            env = this.environment;
                            if (coldResult === 'HALT' || coldResult === 'COMPLETED') { this.status = 'COMPLETED'; break; }
                            if (coldResult === 'UNKNOWN_OP') { this.status = 'CRASHED'; this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`)); break; }
                            steps++; continue;
                        }
                        if (name === 'undefined') v = undefined;
                        else if (env && (name in env)) v = env[name];
                        else if (memGlobals && Object.prototype.hasOwnProperty.call(memGlobals, name)) v = mem.getGlobal(name);
                        else if (vmCtx && (name in vmCtx)) v = vmCtx[name];
                        else throw new ReferenceError(`${String(name)} is not defined`);
                        if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                        stack[sp++] = v;
                        steps++; continue;
                    } else if (op === 0x23) { // STORE_GLOBAL u16
                        if (ip + 1 >= bcLen) { this.ip = ip; this._sp = sp; this.status = 'COMPLETED'; break; }
                        const idx = bc[ip] | (bc[ip + 1] << 8); ip += 2;
                        const name = constants[idx];
                        let v;
                        if (sp > 0) { sp--; v = stack[sp]; stack[sp] = undefined; }
                        if (!noSecurity || (this.withStack && this.withStack.length > 0)) {
                            // B"H: full handler for security/with-scope.
                            if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                            stack[sp++] = v;
                            this.ip = ip; this._sp = sp;
                            coldResult = handlers[op](this);
                            ip = this.ip; sp = this._sp;
                            if (this.bytecode !== bc) { bc = this.bytecode; bcLen = bc.length; constants = this.constants; }
                            if (this.stack !== stack) stack = this.stack;
                            env = this.environment;
                            if (coldResult === 'HALT' || coldResult === 'COMPLETED') { this.status = 'COMPLETED'; break; }
                            if (coldResult === 'UNKNOWN_OP') { this.status = 'CRASHED'; this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`)); break; }
                            steps++; continue;
                        }
                        if (env) env[name] = v;
                        else if (mem) mem.setGlobal(name, v);
                        steps++; continue;
                    // ---- properties (mirrors executors/objects.js fast path) ----
                    } else if (op === 0x32 && noSecurity) { // GET_PROP
                        const key = stack[sp - 1], target = stack[sp - 2];
                        if (target == null || (hasSelf && typeof key === 'string' &&
                            (key === 'values' || key === 'keys' || key === 'entries'))) {
                            // B"H: null warn / legacy Object[key] fallback need the handler.
                        } else {
                            let v = target[key];
                            if (typeof v !== 'function') {
                                stack[sp - 2] = v; stack[sp - 1] = undefined; sp--;
                                steps++; continue;
                            }
                            // B"H: function values may need native-bind (legacyProperty) — cold.
                        }
                    } else if (op === 0x33 && noSecurity) { // SET_PROP
                        const value = stack[sp - 1], key = stack[sp - 2], target = stack[sp - 3];
                        const needsCold = target == null ||
                            (value && value.type === 'CLOSURE' && typeof key === 'string' &&
                                key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) || // 'on*' + CLOSURE: eventClosure
                            (cssStyleDecl && target instanceof cssStyleDecl);
                        if (!needsCold) {
                            target[key] = value;
                            stack[sp - 3] = value; stack[sp - 2] = undefined; stack[sp - 1] = undefined;
                            sp -= 2;
                            steps++; continue;
                        }
                    }
                    // B"H: JSON.parse/stringify fast path (SYS 50/51). Inline only
                    // the host-JSON case on hoisted locals; anything else
                    // (shadowed JSON, bad argc) falls through to the cold
                    // handler, which implements exact generic semantics.
                    if (op === 0x90 && ip + 1 < bcLen) {
                        const sid = bc[ip], sargc = bc[ip + 1];
                        const hj = vm ? vm._hostJSON : null;
                        if ((sid === 50 || sid === 51) && hj && sargc >= 1 && sargc <= 4 && sp >= sargc && stack[sp - sargc] === hj) {
                            ip += 2;
                            const n = sargc - 1;
                            let ja0, ja1, ja2;
                            if (n > 2) { ja2 = stack[--sp]; stack[sp] = undefined; }
                            if (n > 1) { ja1 = stack[--sp]; stack[sp] = undefined; }
                            if (n > 0) { ja0 = stack[--sp]; stack[sp] = undefined; }
                            sp--; stack[sp] = undefined; // pop jsonObj
                            const jw = root.MerkavaVM.wrapForHost;
                            const jw0 = jw ? jw(this, ja0) : ja0;
                            const jw1 = n > 1 ? (jw ? jw(this, ja1) : ja1) : undefined;
                            const jw2 = n > 2 ? (jw ? jw(this, ja2) : ja2) : undefined;
                            let jr;
                            if (sid === 50) jr = n > 1 ? vm._hostJSONParse(jw0, jw1) : vm._hostJSONParse(jw0);
                            else jr = n > 2 ? vm._hostJSONStringify(jw0, jw1, jw2) : n > 1 ? vm._hostJSONStringify(jw0, jw1) : vm._hostJSONStringify(jw0);
                            if (sp >= stack.length) { this._sp = sp; this._growStack(); stack = this.stack; }
                            stack[sp++] = jr;
                            steps++; continue;
                        }
                    }
                    // ---- cold/complex opcodes: sync state, delegate to handler table ----
                    this.ip = ip; this._sp = sp;
                    const handler = handlers[op];
                    if (handler) {
                        coldResult = handler(this);
                    } else if (op === 0x00 || op === 0x0a) {
                        coldResult = undefined;
                    } else {
                        this.status = 'CRASHED';
                        this.rememberCrash(new Error(`Unknown opcode 0x${op.toString(16)} at IP ${ip - 1}`));
                        break;
                    }
                    if (coldResult === 'HALT' || coldResult === 'COMPLETED') {
                        this.status = 'COMPLETED';
                        break;
                    }
                    if (coldResult === 'UNKNOWN_OP') {
                        this.status = 'CRASHED';
                        this.rememberCrash(new Error(`Unknown opcode at IP ${this.ip - 1}`));
                        break;
                    }
                    // B"H: re-sync — CALL/RETURN may have swapped bytecode,
                    // constants, stack, and environment (frame switch).
                    ip = this.ip; sp = this._sp;
                    if (this.bytecode !== bc) { bc = this.bytecode; bcLen = bc.length; constants = this.constants; }
                    if (this.stack !== stack) stack = this.stack;
                    env = this.environment;
                } catch (error) {
                    // B"H: sync before crash bookkeeping so trace/ip/push see truth.
                    this.ip = ip; this._sp = sp;
                    if (this.catchStack && this.catchStack.length > 0) {
                        this.push(this._unwindToCatch(this.catchStack.pop(), error));
                        ip = this.ip; sp = this._sp;
                        bc = this.bytecode; bcLen = bc.length; constants = this.constants;
                        if (this.stack !== stack) stack = this.stack;
                        env = this.environment;
                    } else {
                        this.status = 'CRASHED';
                        this.logCrash(error);
                        break;
                    }
                }
                steps++;
            }
            this.ip = ip; this._sp = sp;
            return steps;
        }
    }

    root.MerkavaVM.Thread = Thread;
    console.log('[MerkavaVM] Thread Class Refined (Stored Tracing Engaged).');
})(typeof self !== 'undefined' ? self : this);


// B"H
(function(root) {
    const previousNamespace = root.MerkavaVM || {};
    
    class MerkavaVM {
        constructor(memoryManager, hostAPI = {}, context = {}, importResolver = null) {
            this.memory = memoryManager;
            this.hostAPI = hostAPI;
            this.context = context;
            this.importResolver = importResolver;
            this.threads = [];
            this.pendingAsyncCount = 0; 
            this.cycleCount = 0;
            this.MAX_THREADS = 128; // B"H - Expanded for density
            // B"H: capture host JSON identity for the JSON.parse/stringify fast
            // path (executors/json.js). The call itself identity-checks the
            // receiver, so shadowing/reassignment stays exactly correct.
            const _hg = memoryManager && memoryManager.globals;
            this._hostJSON = (_hg && _hg.JSON) || null;
            this._hostJSONParse = (this._hostJSON && this._hostJSON.parse) || null;
            this._hostJSONStringify = (this._hostJSON && this._hostJSON.stringify) || null;
        }

        spawn(codeObject) {
            if (this.threads.length >= this.MAX_THREADS) {
                console.warn(`[MerkavaVM] Thread limit reached (${this.MAX_THREADS}). Emanation suppressed.`);
                return { status: 'SUPPRESSED' };
            }

            const ThreadClass = root.MerkavaVM.Thread || MerkavaVM.Thread;
            if (!ThreadClass) throw new Error("MerkavaVM.Thread is not defined.");

            const thread = new ThreadClass(this, codeObject, this.context);
            thread.status = 'RUNNING';
            this.threads.push(thread);
            return thread;
        }

        run(cycles = 1000) {
            let totalStepsInRun = 0;
            
            // B"H - Distributed Cycle Allocation
            while (totalStepsInRun < cycles) {
                let ranSomething = false;
                for (const thread of this.threads) {
                    if (thread.status === 'RUNNING') {
                        thread.step();
                        totalStepsInRun++;
                        this.cycleCount++;
                        ranSomething = true;
                        // Yield if we hit the budget, but ensure the next loop starts from current position
                        if (totalStepsInRun >= cycles) break;
                    }
                }
                if (!ranSomething) break;
            }

            // B"H - Efficient Thread Reaping
            this.threads = this.threads.filter(t => {
                const s = t.status;
                return s === 'RUNNING' || s === 'READY' || s === 'YIELDED' || s === 'AWAITING' || s === 'SUSPENDED';
            });

            return this.threads.length > 0 || this.pendingAsyncCount > 0;
        }
    }

    for (let key in previousNamespace) {
        if (Object.prototype.hasOwnProperty.call(previousNamespace, key)) {
            MerkavaVM[key] = previousNamespace[key];
        }
    }

    root.MerkavaVM = MerkavaVM;
})(typeof self !== 'undefined' ? self : this);

