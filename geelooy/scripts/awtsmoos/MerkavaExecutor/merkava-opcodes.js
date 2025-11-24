// B"H
/**
 * @file merkava-opcodes.js
 * @version 1.0.0 - The Language of the Golem
 * @description
 * Defines the Instruction Set Architecture (ISA) for the Merkava Virtual Machine.
 * These Opcodes represent the atomic units of logic into which the AST is transmuted.
 *
 * This file serves as the shared dictionary between the Compiler (the Scribe)
 * and the Virtual Machine (the Engine). It defines the numeric values of instructions,
 * the states of execution threads, and the interrupt signals used for memory pagination.
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MerkavaOpcodes = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    /**
     * @enum {number}
     * @description
     * The Instruction Set. Each Opcode corresponds to a specific action
     * performed by the Virtual Machine's execution loop.
     */
    const OPCODES = {
        // --- 0x00: CONTROL FLOW & NO-OP ---
        
        /** No Operation. Used for alignment or placeholders. */
        NOP: 0x00,
        
        /** 
         * Halt execution immediately. 
         * Signals the end of a script or a fatal stop. 
         */
        HALT: 0x01,

        /** 
         * Pop the top value from the stack and return it as the function result.
         * If stack is empty, returns undefined.
         */
        RETURN: 0x02,

        /**
         * Unconditional Jump.
         * Operand: [Offset (2 bytes)] - Relative offset to move the Instruction Pointer (IP).
         */
        JUMP: 0x03,

        /**
         * Jump if the top of the stack is Falsy (pop).
         * Operand: [Offset (2 bytes)]
         */
        JUMP_IF_FALSE: 0x04,

        /**
         * Jump if the top of the stack is Truthy (pop).
         * Operand: [Offset (2 bytes)]
         */
        JUMP_IF_TRUE: 0x05,

        /**
         * Jump if the top of the stack is Falsy (does NOT pop).
         * Used for logical short-circuiting (&&).
         * Operand: [Offset (2 bytes)]
         */
        JUMP_IF_FALSE_PERSIST: 0x06,

        /**
         * Jump if the top of the stack is Truthy (does NOT pop).
         * Used for logical short-circuiting (||).
         * Operand: [Offset (2 bytes)]
         */
        JUMP_IF_TRUE_PERSIST: 0x07,


        // --- 0x10: STACK MANIPULATION ---

        /** 
         * Pop the top value and discard it. 
         * Used for Expression Statements where the result is unused.
         */
        POP: 0x10,

        /** Duplicate the top value of the stack. */
        DUP: 0x11,

        /** Swap the top two values of the stack. */
        SWAP: 0x12,

        /**
         * Push a specific value from the Constant Pool onto the stack.
         * Operand: [Index (2 bytes)] - Index in the Constant Table.
         */
        PUSH_CONST: 0x13,

        /** Push `undefined` onto the stack. */
        PUSH_UNDEFINED: 0x14,

        /** Push `null` onto the stack. */
        PUSH_NULL: 0x15,

        /** Push `true` onto the stack. */
        PUSH_TRUE: 0x16,

        /** Push `false` onto the stack. */
        PUSH_FALSE: 0x17,

        /** Push `this` binding onto the stack. */
        PUSH_THIS: 0x18,


        // --- 0x20: VARIABLE ACCESS (MEMORY) ---

        /**
         * Load a variable from the current Stack Frame.
         * Operand: [Index (1 byte)] - Index relative to the Base Pointer (BP).
         */
        LOAD_LOCAL: 0x20,

        /**
         * Store the top of stack into the current Stack Frame (pop).
         * Operand: [Index (1 byte)] - Index relative to the Base Pointer (BP).
         */
        STORE_LOCAL: 0x21,

        /**
         * Load a variable from a specific parent scope (Upvalue).
         * Operand 1: [Scope Depth (1 byte)] - How many scopes up to look.
         * Operand 2: [Index (1 byte)] - Index in that scope.
         */
        LOAD_UPVALUE: 0x22,

        /**
         * Store top of stack into a parent scope (pop).
         * Operand 1: [Scope Depth (1 byte)]
         * Operand 2: [Index (1 byte)]
         */
        STORE_UPVALUE: 0x23,

        /**
         * Load a global variable.
         * Operand: [Index (2 bytes)] - Index of the variable name in Constant Pool.
         */
        LOAD_GLOBAL: 0x24,

        /**
         * Store top of stack into a global variable (pop).
         * Operand: [Index (2 bytes)] - Index of the variable name in Constant Pool.
         */
        STORE_GLOBAL: 0x25,


        // --- 0x30: OBJECTS & ARRAYS ---

        /**
         * Create a new, empty Object and push to stack.
         */
        ALLOC_OBJECT: 0x30,

        /**
         * Create a new, empty Array and push to stack.
         */
        ALLOC_ARRAY: 0x31,

        /**
         * Get Property.
         * Stack Input: [Object, Key]
         * Stack Output: [Value]
         * This is dynamic access (`obj[key]`).
         */
        GET_PROP: 0x32,

        /**
         * Set Property.
         * Stack Input: [Object, Key, Value]
         * Stack Output: [Value] (The assignment result)
         */
        SET_PROP: 0x33,

        /**
         * Define a class method or property during class construction.
         * Stack Input: [ClassPrototype, Key, Value]
         */
        DEFINE_PROP: 0x34,


        // --- 0x40: ARITHMETIC & LOGIC (BINARY) ---
        // All take 2 values from stack, perform op, push result.

        ADD: 0x40, // +
        SUB: 0x41, // -
        MUL: 0x42, // *
        DIV: 0x43, // /
        MOD: 0x44, // %
        POW: 0x45, // **

        // Bitwise
        BIT_AND: 0x46, // &
        BIT_OR:  0x47, // |
        BIT_XOR: 0x48, // ^
        SHL:     0x49, // <<
        SHR:     0x4A, // >>
        USHR:    0x4B, // >>>

        // Comparison
        EQ:         0x4C, // ==
        NEQ:        0x4D, // !=
        STRICT_EQ:  0x4E, // ===
        STRICT_NEQ: 0x4F, // !==
        GT:         0x50, // >
        GTE:        0x51, // >=
        LT:         0x52, // <
        LTE:        0x53, // <=
        INSTANCEOF: 0x54, // instanceof
        IN:         0x55, // in


        // --- 0x60: UNARY OPERATORS ---
        
        NOT:     0x60, // !
        BIT_NOT: 0x61, // ~
        NEGATE:  0x62, // - (unary)
        TYPEOF:  0x63, // typeof
        VOID:    0x64, // void
        DELETE:  0x65, // delete


        // --- 0x70: FUNCTIONS & CLOSURES ---

        /**
         * Create a Closure.
         * Operand: [Index (2 bytes)] - Index of the Function Template in the Constant Pool.
         * Behavior: Creates a function instance binding the current scope to the template.
         */
        CLOSURE: 0x70,

        /**
         * Call a function.
         * Operand: [ArgCount (1 byte)] - Number of arguments on the stack.
         * Stack Input: [Func, This, Arg1, Arg2...]
         * Stack Output: pushes Return Address Frame.
         */
        CALL: 0x71,

        /**
         * Call a constructor (new).
         * Operand: [ArgCount (1 byte)]
         * Stack Input: [Class, Arg1, Arg2...]
         */
        NEW: 0x72,


        // --- 0x80: ASYNC & ATOMICS (The "Blocking" Logic) ---

        /**
         * Await a Promise.
         * Stack Input: [Promise]
         * Behavior: 
         * 1. Pops the Promise.
         * 2. Suspends the current Thread (State is saved).
         * 3. Registers a callback with the Host.
         * 4. VM moves to next Thread.
         * 5. When Promise resolves, Thread is woken up and result pushed to stack.
         */
        AWAIT: 0x80,

        /**
         * Atomic Wait.
         * Stack Input: [Int32Array Pointer, Index, ExpectedValue, Timeout]
         * Behavior: Blocks the Thread if value matches, until NOTIFY or Timeout.
         */
        ATOMIC_WAIT: 0x81,

        /**
         * Atomic Notify.
         * Stack Input: [Int32Array Pointer, Index, Count]
         * Behavior: Wakes up 'Count' threads blocked on this address.
         */
        ATOMIC_NOTIFY: 0x82,


        // --- 0x90: SYSTEM & DEBUGGING ---

        /**
         * System Call (Host API).
         * Operand: [Index (1 byte)] - ID of the SysCall (e.g., 0=print, 1=fetch).
         * Stack Input: [Args Array]
         */
        SYSCALL: 0x90,

        /**
         * Throw Exception.
         * Stack Input: [Error Object]
         * Behavior: Unwinds stack looking for CATCH block.
         */
        THROW: 0x91,

        /**
         * Enter Try Block.
         * Operand: [Catch Offset (2 bytes)] - Where to jump if exception occurs.
         * Operand: [Finally Offset (2 bytes)] - Where to jump after try/catch.
         */
        ENTER_TRY: 0x92,

        /**
         * Exit Try/Catch Block.
         * Cleans up the exception handler from the frame.
         */
        EXIT_TRY: 0x93,

        /**
         * Debugger Breakpoint.
         * Operand: [Line Number (2 bytes)]
         * Behavior: Pauses execution and invokes Host Debugger Hook.
         */
        DEBUGGER: 0x94
    };

    /**
     * @constant
     * Reverse mapping of Opcode Values to Names for debugging disassembly.
     */
    const OPCODE_NAMES = Object.fromEntries(
        Object.entries(OPCODES).map(([k, v]) => [v, k])
    );

    /**
     * @enum {number}
     * @description Represents the lifecycle state of a Green Thread in the VM.
     */
    const VM_THREAD_STATUS = {
        /** Thread is active and in the scheduler queue. */
        RUNNING: 0,
        
        /** Thread has finished execution naturally. */
        COMPLETED: 1,
        
        /** Thread crashed with an unhandled exception. */
        CRASHED: 2,
        
        /** Thread is waiting for an Async Promise (AWAIT). */
        BLOCKED_ASYNC: 3,
        
        /** Thread is waiting for an Atomic lock (ATOMIC_WAIT). */
        BLOCKED_ATOMICS: 4,
        
        /** 
         * Thread is paused because it tried to access data not in RAM.
         * The Memory Manager is currently fetching data from IndexedDB.
         */
        WAITING_FOR_PAGE: 5,
        
        /** Thread manually paused by Debugger. */
        PAUSED_BY_DEBUGGER: 6
    };

    /**
     * @enum {number}
     * @description Interrupt codes thrown by the Execution Engine to the Host Loop.
     */
    const INTERRUPTS = {
        /** No interrupt, normal operation. */
        NONE: 0,
        
        /** 
         * The Engine accessed a Heap Pointer not present in the RAM Cache.
         * Host must suspend the loop and fetch the object ID from IndexedDB.
         */
        PAGE_FAULT: 100,
        
        /**
         * The Engine hit an AWAIT opcode.
         * Host must handle the Promise and resume later.
         */
        ASYNC_YIELD: 101,
        
        /**
         * The Engine executed SYSCALL.
         * Host must perform the I/O operation.
         */
        SYSCALL: 102
    };

    return {
        OPCODES,
        OPCODE_NAMES,
        VM_THREAD_STATUS,
        INTERRUPTS,
        
        /**
         * Helper to get the string name of an opcode.
         * @param {number} op - The byte value.
         * @returns {string} The name (e.g., "ADD").
         */
        getOpName: (op) => OPCODE_NAMES[op] || `UNKNOWN(0x${op.toString(16)})`
    };
}));