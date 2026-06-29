// B"H
const TYPES = Object.freeze([
  'object','desktop','window','process','drive','file','folder','preview',
  'mission','terminal','browser-tab','display','session','input','permission',
  'application','notification','device','clipboard','user','ai','mount',
  'transaction','reference','scene','workspace','taskbar'
]);
const RIGHTS = Object.freeze(['read','write','control','share','delete','watch']);
function valid(type) { return TYPES.includes(type) ? type : 'object'; }
function normalizeList(value) { return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []; }
/**
 * B"H
 * The type table is the first firmament of the graph. Each name is a vessel:
 * desktop, drive, session, preview, mission, AI user, and every small spark
 * that waits for permission before it crosses the tunnel-water.
 */
module.exports = { TYPES, RIGHTS, valid, normalizeList };
