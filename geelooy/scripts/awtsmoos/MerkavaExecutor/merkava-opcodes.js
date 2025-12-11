// B"H
/**
 * @file merkava-opcodes.js
 * @version 2.0.0 - The Complete Language of Creation
 */

(function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MerkavaOpcodes = factory();
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
        PUSH_META: 0x19, // new.target, import.meta

        // Variables
        LOAD_LOCAL: 0x20,
        STORE_LOCAL: 0x21,
        LOAD_GLOBAL: 0x22, // Checks global + with_stack
        STORE_GLOBAL: 0x23,
        LOAD_UPVALUE: 0x24, // Closure support
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
        MAKE_CLASS: 0x73, // Defines a class constructor
        GET_SUPER: 0x74,  // Retrieves superclass method

        // Async & Generators
        AWAIT: 0x80,
        YIELD: 0x81,
        YIELD_STAR: 0x82, // Delegated yield

        // System
        SYSCALL: 0x90,
        THROW: 0x91,
        ENTER_TRY: 0x92,
        EXIT_TRY: 0x93,
        DEBUGGER: 0x94,
        IMPORT: 0x95, // Dynamic Import

        // Iteration & Control
        GET_ITERATOR: 0xA0,
        ITERATOR_NEXT: 0xA1,
        ITERATOR_DONE: 0xA2,
        ITERATOR_VALUE: 0xA3,
        
        // Advanced Control Flow
        ENUMERATE: 0xA4, // For-In keys
        CHAIN_CHECK: 0xA5, // Optional Chaining branch
        WITH_ENTER: 0xA6,
        WITH_EXIT: 0xA7
    };

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