
// B"H

const { json } = require("../tools/respond.js");
const { readBearer } = require("../core/tokenReader.js");

/**
 * B"H
 * Reads the OAuth bearer token and returns the user identity.
 *
 * This is the first protected OAuth test route.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON identity response.
 */
async function me($i) {
  const auth = readBearer($i);

  if (!auth.ok) {
    return json($i, {
      BH: "B\"H",
      ok: false,
      error: auth.error,
      details: auth.details || null
    }, 401);
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
