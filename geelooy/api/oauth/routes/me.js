
// B"H

const { json } = require("../tools/respond.js");
const { readBearer } = require("../core/tokenReader.js");

/**
 * B"H
 * Reads the bearer token and reveals its account identity.
 * Not the user's hidden soul, not their secrets, only the scoped OAuth vessel.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON response with token identity.
 */
async function me($i) {
  const auth = readBearer($i);

  if (!auth.ok) {
    return json($i, { BH: "B\"H", ok: false, error: auth.error }, 401);
  }

  return json($i, {
    BH: "B\"H",
    ok: true,
    userId: auth.entry.userId,
    clientId: auth.entry.clientId,
    scope: auth.entry.scope,
    tokenKind: auth.entry.kind
  });
}

module.exports = { me };
