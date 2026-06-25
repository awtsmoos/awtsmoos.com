// B"H
// A pool returns forms to silence and brings them back without waste.
export function createPool(make, reset = x => x) {
  const free = [];
  function take(...args) { const item = free.pop() || make(); return reset(item, ...args); }
  function give(item) { free.push(item); }
  function trim(n = 64) { while (free.length > n) free.pop(); }
  return { take, give, trim, free: () => free.length };
}
