// B"H
/**
 * LocalSymbolTable is the app-local vocabulary made during compilation.
 * Native words point into the eternal runtime table. Custom words appear once
 * here, then every later use is a tiny integer reference.
 */
class LocalSymbolTable {
  constructor(nativeIndex = {}) {
    this.nativeIndex = nativeIndex;
    this.custom = [];
    this.customIndex = new Map();
  }

  ref(value) {
    const text = value == null ? '' : String(value);
    if (Object.prototype.hasOwnProperty.call(this.nativeIndex, text)) {
      return { native: true, id: this.nativeIndex[text], text };
    }
    let id = this.customIndex.get(text);
    if (id === undefined) {
      id = this.custom.length;
      this.customIndex.set(text, id);
      this.custom.push(text);
    }
    return { native: false, id, text };
  }

  encode(value) {
    const ref = this.ref(value);
    return (ref.id << 1) | (ref.native ? 0 : 1);
  }
}

function decodeLocalRef(encoded, custom = [], nativeWords = []) {
  return (encoded & 1) ? (custom[encoded >> 1] || '') : (nativeWords[encoded >> 1] || '');
}

module.exports = { LocalSymbolTable, decodeLocalRef };
