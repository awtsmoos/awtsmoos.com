// B"H
const TYPES = Object.freeze([
  'object','desktop','window','process','drive','file','folder','preview',
  'mission','terminal','browser-tab','display','session','input','permission',
  'application','notification','device','clipboard','user','ai','mount',
  'transaction','reference','scene','workspace','taskbar','civilization','feed',
  'post','comment','alias','heichel','event','metric','inspector'
]);
const RIGHTS = Object.freeze(['read','write','control','share','delete','watch']);
function valid(type) { return TYPES.includes(type) ? type : 'object'; }
function normalizeList(value) { return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []; }
/**
 * B"H
 * The server mirror now knows the social nouns spoken by the browser graph, so
 * live Geelooy cards do not lose their names while crossing tunnel-water.
 */
module.exports = { TYPES, RIGHTS, valid, normalizeList };
