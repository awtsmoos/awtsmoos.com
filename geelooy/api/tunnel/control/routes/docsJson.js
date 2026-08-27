
// B"H

const { json } = require("../core/respond.js");
const { apiCatalog } = require("../docs/catalog.js");

async function docsJson($i) {
  return json($i, apiCatalog);
}

module.exports = { docsJson };
