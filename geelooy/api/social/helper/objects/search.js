// B"H
/** Chapter 590: Search everything by meaning text over the normalized object body. */
const { listObjects } = require('./store.js');
function searchObjects({ $i, q = '', type = '', limit = 50 }) {
  return listObjects({ $i, query: { q, type }, limit });
}
module.exports = { searchObjects };
