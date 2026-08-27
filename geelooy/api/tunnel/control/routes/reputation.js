// B"H
const { treasuryReputation } = require("./treasury/reputation.js");

/**
 * B"H
 * Root reputation route alias.
 * The reputation economy lives inside the Treasury OS, yet old and future
 * clients may enter through `/reputation`; this keeps the same audited gate.
 */
async function reputation($i) {
  return treasuryReputation($i);
}
module.exports = { reputation };
