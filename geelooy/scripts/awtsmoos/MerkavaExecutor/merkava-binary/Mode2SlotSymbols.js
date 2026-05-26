// B"H
/**
 * Chapter 2: The Scribe Who Counted Lightning.
 *
 * Names enter this resolver as thunder, but locals leave as numbers. The
 * Awtsmoos reveals that every lexical chamber needs only its slot count and a
 * parent link; globals may still speak through the string pool, while true
 * locals become compact ids fit for MD2 byte lanes.
 */
class Mode2SlotScope {
  /**
   * @param {Mode2SlotScope|null} parent Parent lexical scope.
   */
  constructor(parent = null) {
    this.parent = parent;
    this.names = new Map();
    this.slotCount = 0;
  }

  /**
   * Declares a local name and returns its stable slot id.
   * @param {string} name Local variable name.
   * @returns {number} Numeric slot id in this scope.
   */
  declare(name) {
    const key = String(name || '');
    if (!key) throw new Error('MD2 slot local name is empty');
    if (this.names.has(key)) return this.names.get(key);
    const slot = this.slotCount++;
    this.names.set(key, slot);
    return slot;
  }

  /**
   * Resolves a name as local, closure, or global.
   * @param {string} name Identifier name.
   * @returns {{kind:string,slot?:number,depth?:number,name?:string}}
   */
  resolve(name) {
    const key = String(name || '');
    let scope = this, depth = 0;
    while (scope) {
      if (scope.names.has(key)) {
        const slot = scope.names.get(key);
        return depth === 0 ? { kind: 'local', slot } : { kind: 'closure', depth, slot };
      }
      scope = scope.parent;
      depth++;
    }
    return { kind: 'global', name: key };
  }

  /**
   * Opens a child lexical scope.
   * @returns {Mode2SlotScope} Child scope linked to this scope.
   */
  child() {
    return new Mode2SlotScope(this);
  }
}

/**
 * Creates a root scope and declares initial parameter/local names.
 * @param {string[]} names Names to reserve in order.
 * @returns {Mode2SlotScope} Prepared root scope.
 */
function makeMode2SlotScope(names = []) {
  const scope = new Mode2SlotScope();
  for (const name of names) scope.declare(name);
  return scope;
}

module.exports = { Mode2SlotScope, makeMode2SlotScope };
