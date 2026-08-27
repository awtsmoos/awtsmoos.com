
// B"H

const { json } = require("../tools/respond.js");
const { listClients } = require("../core/clients.js");

/**
 * B"H
 * Lists public OAuth client metadata.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON client list.
 */
async function clients($i) {
  return json($i, {
    BH: "B\"H",
    ok: true,
    clients: listClients()
  });
}

module.exports = { clients };
