// B"H — WASM tests Tier D: i64 numeric ops (25 tests). BigInt expected values.
const op2 = (name, op, a, b, expect) => ({
  name, wat: `(module (func (export "m") (param i64 i64) (result i64) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expect: [expect], xcheck: true,
});
const op1 = (name, op, a, expect, res = 'i64', ret = 'i64') => ({
  name, wat: `(module (func (export "m") (param ${res}) (result ${ret}) (${op} (local.get 0))))`,
  export: 'm', args: [a], expect: [expect], xcheck: true,
});
const cmp2 = (name, op, a, b, expect) => ({
  name, wat: `(module (func (export "m") (param i64 i64) (result i32) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expect: [expect], xcheck: true,
});
const TRAP = (name, op, a, b, code) => ({
  name, wat: `(module (func (export "m") (param i64 i64) (result i64) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expectTrap: code,
});
const I64MIN = -(1n << 63n);
const I64MAX = (1n << 63n) - 1n;

export const tests = [
  op2('i64.add', 'i64.add', 5000000000n, 7000000000n, 12000000000n),
  op2('i64.add wrap', 'i64.add', I64MAX, 1n, I64MIN),
  op2('i64.sub', 'i64.sub', 10n, 25n, -15n),
  op2('i64.mul', 'i64.mul', 100000000000n, 100000000000n, BigInt.asInt64(100000000000n * 100000000000n)),
  op2('i64.div_s', 'i64.div_s', -7n, 3n, -2n),
  op2('i64.div_u', 'i64.div_u', -1n, 2n, (1n << 63n) - 1n),
  op2('i64.rem_s', 'i64.rem_s', -7n, 3n, -1n),
  op2('i64.rem_u', 'i64.rem_u', -1n, 7n, 1n), // (2^64-1) % 7 = 1
  op2('i64.and', 'i64.and', 0b1100n, 0b1010n, 0b1000n),
  op2('i64.or', 'i64.or', 0b1100n, 0b1010n, 0b1110n),
  op2('i64.shl', 'i64.shl', 1n, 63n, I64MIN),
  op2('i64.shr_u', 'i64.shr_u', -8n, 2n, 4611686018427387902n),
  op2('i64.rotr', 'i64.rotr', 1n, 1n, I64MIN),
  op1('i64.clz', 'i64.clz', 1n, 63n),
  op1('i64.ctz 0', 'i64.ctz', 0n, 64n),
  op1('i64.popcnt -1', 'i64.popcnt', -1n, 64n),
  op1('i64.eqz 0', 'i64.eqz', 0n, 1, 'i64', 'i32'),
  cmp2('i64.lt_s', 'i64.lt_s', -5n, 3n, 1),
  cmp2('i64.lt_u', 'i64.lt_u', -1n, 0n, 0),
  cmp2('i64.gt_u', 'i64.gt_u', -1n, 0n, 1),
  TRAP('i64.div_s by zero', 'i64.div_s', 1n, 0n, 'int-divide-by-zero'),
  TRAP('i64.div_s MIN/-1', 'i64.div_s', I64MIN, -1n, 'int-overflow'),
  TRAP('i64.rem_u by zero', 'i64.rem_u', 1n, 0n, 'int-divide-by-zero'),
  { name: 'i64.const negative', wat: '(module (func (export "m") (result i64) (i64.const -9223372036854775808)))', export: 'm', args: [], expect: [I64MIN], xcheck: true },
  { name: 'i64 wrap via i32', wat: '(module (func (export "m") (param i32) (result i64) (i64.extend_i32_u (local.get 0))))', export: 'm', args: [-1], expect: [0xffffffffn], xcheck: true },
];
