// B"H
const { handleFsAction } = require("./actions.js");

async function handleFs(payload, ws) {
  return await handleFsAction(payload, ws);
}

module.exports = { handleFs };