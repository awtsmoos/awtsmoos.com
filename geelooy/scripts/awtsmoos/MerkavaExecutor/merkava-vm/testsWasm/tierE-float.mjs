// B"H — WASM tests Tier E: f32/f64 arithmetic (25 tests).
const f32 = (name, op, a, b, expect) => ({
  name, wat: `(module (func (export "m") (param f32 f32) (result f32) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expect: [expect], xcheck: true,
});
const f64 = (name, op, a, b, expect) => ({
  name, wat: `(module (func (export "m") (param f64 f64) (result f64) (${op} (local.get 0) (local.get 1))))`,
  export: 'm', args: [a, b], expect: [expect], xcheck: true,
});
const f1 = (name, t, op, a, expect) => ({
  name, wat: `(module (func (export "m") (param ${t}) (result ${t}) (${op} (local.get 0))))`,
  export: 'm', args: [a], expect: [expect], xcheck: true,
});
const NAN = NaN;
const isNaNExpect = (name, t, op, a) => ({
  name, wat: `(module (func (export "m") (param ${t}) (result ${t}) (${op} (local.get 0))))`,
  export: 'm', args: [a], expect: [NaN], xcheck: true,
});

export const tests = [
  f32('f32.add', 'f32.add', 0.1, 0.2, Math.fround(Math.fround(0.1) + Math.fround(0.2))),
  f32('f32.sub', 'f32.sub', 1.5, 0.5, 1),
  f32('f32.mul', 'f32.mul', 2.5, 4, 10),
  f32('f32.div', 'f32.div', 7, 2, 3.5),
  f32('f32.div by zero', 'f32.div', 1, 0, Infinity),
  f32('f32.min', 'f32.min', 3, 7, 3),
  f32('f32.max', 'f32.max', 3, 7, 7),
  f64('f64.add', 'f64.add', 0.1, 0.2, 0.30000000000000004),
  f64('f64.sub', 'f64.sub', 1e300, 1e300, 0),
  f64('f64.mul precision', 'f64.mul', 1.1, 1.1, 1.2100000000000002),
  f64('f64.div', 'f64.div', 22, 7, 22 / 7),
  f64('f64.div neg zero', 'f64.div', -1, 0, -Infinity),
  f64('f64.min negzero', 'f64.min', 0, -0, -0),
  f64('f64.max negzero', 'f64.max', 0, -0, 0),
  f1('f32.sqrt', 'f32', 'f32.sqrt', 2, Math.fround(Math.sqrt(2))),
  f1('f64.sqrt', 'f64', 'f64.sqrt', 2, Math.SQRT2),
  f1('f32.abs neg', 'f32', 'f32.abs', -3.5, 3.5),
  f1('f64.neg', 'f64', 'f64.neg', 3.5, -3.5),
  f1('f32.ceil', 'f32', 'f32.ceil', 2.1, 3),
  f1('f32.floor', 'f32', 'f32.floor', 2.9, 2),
  f1('f64.trunc', 'f64', 'f64.trunc', -2.9, -2),
  f1('f64.nearest .5 even', 'f64', 'f64.nearest', 2.5, 2),
  f1('f64.nearest .5 odd', 'f64', 'f64.nearest', 3.5, 4),
  isNaNExpect('f32.sqrt neg is NaN', 'f32', 'f32.sqrt', -1),
  isNaNExpect('f64 0/0 is NaN', 'f64', 'f64.sqrt', -4),
];
