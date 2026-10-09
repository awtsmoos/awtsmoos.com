// B"H — WASM tests Tier C: i32 numeric ops (40 tests).
// Each: single-export module running the op on the given args.
const op2 = (name, op, a, b, expect) => ({
  name, wat: `(module (func (export "m") (param i32 i32) (result i32) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expect: [expect], xcheck: true,
});
const op1 = (name, op, a, expect) => ({
  name, wat: `(module (func (export "m") (param i32) (result i32) (${op} (local.get 0))))`,
  export: 'm', args: [a], expect: [expect], xcheck: true,
});
const TRAP = (name, op, a, b, code) => ({
  name, wat: `(module (func (export "m") (param i32 i32) (result i32) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expectTrap: code,
});

export const tests = [
  op2('i32.add', 'i32.add', 2000000000, 147483647, 2147483647),
  op2('i32.add wrap', 'i32.add', -1, 1, 0),
  op2('i32.sub', 'i32.sub', 10, 4, 6),
  op2('i32.sub wrap', 'i32.sub', 0, 1, -1),
  op2('i32.mul', 'i32.mul', 100000, 100000, 1410065408),
  op2('i32.div_s', 'i32.div_s', 7, 3, 2),
  op2('i32.div_s neg', 'i32.div_s', -7, 3, -2),
  op2('i32.div_s neg2', 'i32.div_s', 7, -3, -2),
  op2('i32.div_u', 'i32.div_u', -1, 2, 2147483647),
  op2('i32.rem_s', 'i32.rem_s', -7, 3, -1),
  op2('i32.rem_u', 'i32.rem_u', -7, 3, 0), // 4294967289 = 3 * 1431655763
  op2('i32.and', 'i32.and', 0b1100, 0b1010, 0b1000),
  op2('i32.or', 'i32.or', 0b1100, 0b1010, 0b1110),
  op2('i32.xor', 'i32.xor', 0b1100, 0b1010, 0b0110),
  op2('i32.shl', 'i32.shl', 1, 31, -2147483648),
  op2('i32.shl mask', 'i32.shl', 1, 33, 2),
  op2('i32.shr_s', 'i32.shr_s', -8, 2, -2),
  op2('i32.shr_u', 'i32.shr_u', -8, 2, 1073741822),
  op2('i32.rotl', 'i32.rotl', 0x80000001, 1, 3),
  op2('i32.rotr', 'i32.rotr', 0x80000001, 1, -1073741824),
  op1('i32.clz 0', 'i32.clz', 0, 32),
  op1('i32.clz 1', 'i32.clz', 1, 31),
  op1('i32.ctz 0', 'i32.ctz', 0, 32),
  op1('i32.ctz 8', 'i32.ctz', 8, 3),
  op1('i32.popcnt', 'i32.popcnt', 0b101101, 4),
  op1('i32.popcnt -1', 'i32.popcnt', -1, 32),
  op1('i32.eqz 0', 'i32.eqz', 0, 1),
  op1('i32.eqz 5', 'i32.eqz', 5, 0),
  op2('i32.eq', 'i32.eq', 5, 5, 1),
  op2('i32.ne', 'i32.ne', 5, 6, 1),
  op2('i32.lt_s', 'i32.lt_s', -1, 0, 1),
  op2('i32.lt_u', 'i32.lt_u', -1, 0, 0),
  op2('i32.gt_u', 'i32.gt_u', -1, 0, 1),
  op2('i32.le_s', 'i32.le_s', 5, 5, 1),
  op2('i32.ge_u', 'i32.ge_u', 0, -1, 0),
  TRAP('i32.div_s by zero', 'i32.div_s', 1, 0, 'int-divide-by-zero'),
  TRAP('i32.div_u by zero', 'i32.div_u', 1, 0, 'int-divide-by-zero'),
  TRAP('i32.div_s INT_MIN/-1', 'i32.div_s', -2147483648, -1, 'int-overflow'),
  TRAP('i32.rem_s by zero', 'i32.rem_s', 1, 0, 'int-divide-by-zero'),
  TRAP('i32.rem_u by zero', 'i32.rem_u', 1, 0, 'int-divide-by-zero'),
];
