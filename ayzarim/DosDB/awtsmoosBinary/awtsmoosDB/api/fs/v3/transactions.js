// B"H
/**
 * @file transactions.js
 * @chapter The Ark Did Not Open For Every Footstep
 * @description
 * Synchronous transaction metadata for VirtualFs v3. A filesystem operation
 * mutates the in-memory manifest only; persistence happens at `fs.flush()` or
 * database close. This keeps edit storms from writing one full manifest per
 * tiny step while every logical byte remains exact and unpadded.
 */

const { root, markTx } = require("./store");
const { enterWrite } = require("./locks");

function withFsTx(db, label, fn) {
  return enterWrite(db, label, () => {
    const fsRoot = root(db);
    const id = (fsRoot.tx.lastCommitted || 0) + 1;
    db.__fs3BatchDepth = (db.__fs3BatchDepth || 0) + 1;
    try {
      markTx(db, { active: { id, label, startedAt: Date.now() }, lastCommitted: fsRoot.tx.lastCommitted || 0 });
      const result = fn();
      markTx(db, { active: null, lastCommitted: id });
      db.__fs3BatchDepth--;
      return result;
    } catch (error) {
      markTx(db, { active: { id, label, failedAt: Date.now(), error: error.message }, lastCommitted: fsRoot.tx.lastCommitted || 0 });
      db.__fs3BatchDepth--;
      throw error;
    }
  });
}

module.exports = { withFsTx };
