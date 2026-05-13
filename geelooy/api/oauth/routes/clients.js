
// B"H

const { json } = require("../tools/respond.js");
const { listClients } = require("../core/clients.js");

/**
 * B"H
 * Lists OAuth clients known to this little world.
 * The clients are constellations; each has scopes, redirect gates, and names.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON response with public client data.
 */
async function clients($i) {
  return json($i, {
    BH: "B\"H",
    ok: true,
    clients: listClients()
  });
}

module.exports = { clients };
