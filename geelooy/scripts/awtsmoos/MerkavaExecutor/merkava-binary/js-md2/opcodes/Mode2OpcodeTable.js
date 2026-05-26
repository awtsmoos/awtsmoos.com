// B"H
'use strict';

/**
 * Chapter 1: The Awtsmoos breathes through the opcode gate.
 *
 * The old monolith held repeated names like sparks trapped in cracked metal.
 * This table gathers each MD2 JavaScript opcode once, cleanly, so later
 * extraction can move compiler and runtime handlers without changing numeric
 * binary meaning. The numbers are sacred compatibility stones: do not reorder.
 *
 * @returns {Readonly<Record<string, number>>} frozen opcode name-to-id table.
 */
function createMode2OpcodeTable() {
  return Object.freeze({
    EXT: 0,
    CONST: 1,
    LOAD: 2,
    STORE: 3,
    ADD: 4,
    SUB: 5,
    MUL: 6,
    DIV: 7,
    ARRAY: 8,
    GET_PROP: 9,
    CALL_METHOD: 10,
    RETURN: 11,
    MAKE_FUNCTION: 12,
    CALL_FUNCTION: 13,
    GT: 14,
    LT: 15,
    JUMP_IF_FALSE: 16,
    JUMP: 17,
    POP: 18,
    OBJECT: 19,
    SET_PROP: 20,
    EQ: 21,
    STRICT_EQ: 22,
    NEQ: 23,
    GTE: 24,
    LTE: 25,
    MOD: 26,
    INSTANCEOF: 27,
    NEW: 28,
    NOT: 29,
    AND: 30,
    OR: 31,
    MERGE_OBJECT: 32,
    STRICT_NEQ: 33,
    AWAIT: 34,
    THROW: 35,
    NEG: 36,
    TYPEOF: 37,
    VOID: 38,
    POS: 39,
    DELETE_PROP: 40,
    IN: 41,
    CALL_METHOD_SPREAD: 42,
    CALL_FUNCTION_SPREAD: 43,
    DECLARE: 44,
    GET_PROP_DYNAMIC: 45,
    SET_PROP_DYNAMIC: 46,
    CALL_SUPER: 47,
    YIELD: 48,
    ENTER_TRY: 49,
    EXIT_TRY: 50,
    MAKE_FUNCTION_SNAPSHOT: 51,
    DECLARE_CONST: 52,
    INC_LOCAL: 53,
    CALL_METHOD_0: 54,
    LOAD_SLOT: 55,
    STORE_SLOT: 56,
    DECLARE_SLOT: 57,
    INC_SLOT: 58
  });
}

const MODE2_JS_OP = createMode2OpcodeTable();

module.exports = { MODE2_JS_OP, createMode2OpcodeTable };
