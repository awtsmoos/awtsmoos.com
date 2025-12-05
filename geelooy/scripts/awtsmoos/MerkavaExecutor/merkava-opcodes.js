// B"H
/**
 * @file merkava-opcodes.js
 * @version 1.0.1 - The Language of the Golem
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
        JUMP_IF_FALSE_PERSIST: 0x06,
        JUMP_IF_TRUE_PERSIST: 0x07,

        POP: 0x10,
        DUP: 0x11,
        SWAP: 0x12,
        PUSH_CONST: 0x13,
        PUSH_UNDEFINED: 0x14,
        PUSH_NULL: 0x15,
        PUSH_TRUE: 0x16,
        PUSH_FALSE: 0x17,
        PUSH_THIS: 0x18,

        LOAD_LOCAL: 0x20,
        STORE_LOCAL: 0x21,
        LOAD_UPVALUE: 0x22,
        STORE_UPVALUE: 0x23,
        LOAD_GLOBAL: 0x24,
        STORE_GLOBAL: 0x25,

        ALLOC_OBJECT: 0x30,
        ALLOC_ARRAY: 0x31,
        GET_PROP: 0x32,
        SET_PROP: 0x33,
        DEFINE_PROP: 0x34,
        SET_PROTOTYPE: 0x35,

        ADD: 0x40,
        SUB: 0x41,
        MUL: 0x42,
        DIV: 0x43,
        MOD: 0x44,
        POW: 0x45,
        BIT_AND: 0x46,
        BIT_OR:  0x47,
        BIT_XOR: 0x48,
        SHL:     0x49,
        SHR:     0x4A,
        USHR:    0x4B,

        EQ:         0x4C,
        NEQ:        0x4D,
        STRICT_EQ:  0x4E,
        STRICT_NEQ: 0x4F,
        GT:         0x50,
        GTE:        0x51,
        LT:         0x52,
        LTE:        0x53,
        INSTANCEOF: 0x54,
        IN:         0x55,

        NOT:     0x60,
        BIT_NOT: 0x61,
        NEGATE:  0x62,
        TYPEOF:  0x63,
        VOID:    0x64,
        DELETE:  0x65,

        CLOSURE: 0x70,
        CALL: 0x71,
        NEW: 0x72,

        AWAIT: 0x80,
        ATOMIC_WAIT: 0x81,
        ATOMIC_NOTIFY: 0x82,

        SYSCALL: 0x90,
        THROW: 0x91,
        ENTER_TRY: 0x92,
        EXIT_TRY: 0x93,
        DEBUGGER: 0x94,
        LOAD_ERROR: 0x95,
    };

    const OPCODE_NAMES = Object.fromEntries(
        Object.entries(OPCODES).map(([k, v]) => [v, k])
    );

    const VM_THREAD_STATUS = {
        RUNNING: 0,
        COMPLETED: 1,
        CRASHED: 2,
        BLOCKED_ASYNC: 3,
        BLOCKED_ATOMICS: 4,
        WAITING_FOR_PAGE: 5,
        PAUSED_BY_DEBUGGER: 6
    };

    return {
        OPCODES,
        OPCODE_NAMES,
        VM_THREAD_STATUS,
        getOpName: (op) => OPCODE_NAMES[op] || `UNKNOWN(0x${op.toString(16)})`
    };
}));