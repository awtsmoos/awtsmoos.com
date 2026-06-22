
// B"H

const { transport } = require("./transport.js");
const { actions } = require("./actions.js");
const { listingModes } = require("./listingModes.js");

const apiCatalog = {
  BH: "B\"H",
  ok: true,
  name: "Awtsmoos Tunnel Control API",
  version: "3.2.1",
  base: "https://awtsmoos.com",
  controlPanel: "https://awtsmoos.com/apps/tunnel-control/",
  openapi: "https://awtsmoos.com/api/tunnel/control/openapi",
  openapiStatic: "https://awtsmoos.com/apps/tunnel-control/openapi.yaml",
  myDevice: "/api/tunnel/control/my-device",
  transport,
  actions,
  listingModes,
  commandLifecycle: {
    canonical: ["command", "commandStatus", "commandJobOutputPage", "commandWait", "commandCancel"],
    aliases: { commandWait: ["commandJobWait", "waitForJob", "jobWait"], commandStatus: ["commandPoll", "commandJobStatus"], commandJobOutputPage: ["commandOutputPage"] },
    jobIdCarriers: ["jobId", "id", "params.jobId", "params.id"],
    compatibility: "Existing commandRun/commandStart behavior is preserved; lifecycle fields are promoted from params and top-level payloads."
  },
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
