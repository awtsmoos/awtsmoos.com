// B"H
const { ALL_NATIVE_WORDS, NATIVE_INDEX } = require('./NativeTables.js');
/**
 * WebBinaryOpcodes is the raw alphabet of a browser-world.
 * Native words are no longer source text; they are VM-known ids.
 */
const WEB_OPS = Object.freeze({
  END: 0x00,
  CREATE_NODE: 0x01,
  SET_STYLE: 0x02,
  BIND_EVENT: 0x03,
  SET_TEXT: 0x04,
  APPEND_CHILD: 0x05,
  EMIT: 0x06,
  CREATE_NODE_SERIES: 0x07,
  SET_STYLE_SERIES: 0x08,
  SET_ATTR: 0x09,
  SET_STYLE_BLOCK: 0x0A
});
const WEB_BUILTINS = ALL_NATIVE_WORDS;
const WEB_BUILTIN_INDEX = NATIVE_INDEX;
const WEB_OP_NAMES = Object.freeze(Object.fromEntries(Object.entries(WEB_OPS).map(([name, code]) => [code, name])));
module.exports = { WEB_OPS, WEB_OP_NAMES, WEB_BUILTINS, WEB_BUILTIN_INDEX };
