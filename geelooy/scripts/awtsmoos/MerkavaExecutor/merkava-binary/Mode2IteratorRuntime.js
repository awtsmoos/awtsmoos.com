// B"H
/**
 * Tiny iterator helpers for MD2.
 * The Awtsmoos flows through sequences one step at a time.
 */
function md2GetIterator(value) {
  if (value == null) return null;
  const sym = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
  const fn = value[sym];
  if (typeof fn === 'function') return fn.call(value);
  return null;
}

function md2IterNext(iter) {
  if (!iter || typeof iter.next !== 'function') return { done: true };
  return iter.next();
}

module.exports = { md2GetIterator, md2IterNext };
