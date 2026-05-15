
// B"H

const { transport } = require("./transport.js");
const { actions } = require("./actions.js");
const { listingModes } = require("./listingModes.js");

const apiCatalog = {
  BH: "B\"H",
  ok: true,
  name: "Awtsmoos Tunnel Control API",
  version: "3.2.0",
  base: "https://awtsmoos.com",
  controlPanel: "https://awtsmoos.com/apps/tunnel-control/",
  openapi: "https://awtsmoos.com/api/tunnel/control/openapi",
  openapiStatic: "https://awtsmoos.com/apps/tunnel-control/openapi.yaml",
  myDevice: "/api/tunnel/control/my-device",
  transport,
  actions,
  listingModes,
  defaults: {
    maxFiles: 3,
    maxChars: 8000,
    totalMaxChars: 24000,
    treeDepth: 2,
    treeLimit: 150
  },
  warning:
    "Never guess project structure. Use list/tree/read in small chunks and inspect real files."
};

module.exports = { apiCatalog };
