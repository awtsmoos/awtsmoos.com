
// B"H

const doFileResponse = require("../fileServer.js");
const { errorMessage } = require("../utils.js");

async function maybeFileFallback(context, didThisPathAlready) {
  const { request } = context.dependencies;

  if (context.isDirectoryWithIndex || context.isRealFile) {
    var startsWithAw = context.fileName.startsWith("_awtsmoos");

    if (!startsWithAw || request.superSecret) {
      return await doFileResponse(context);
    }

    return errorMessage(context, "You're not allowed to see that!");
  }

  return errorMessage(context, {
    message: "Invalid Dynamic Route",
    code: "INVALID_DYNAMIC_ROUTE",
    more: {
      didThisPathAlready,
      foundAwtsmooses: context.foundAwtsmooses,
      idwi: context.isDirectoryWithIndex,
      logs: context.logs
    }
  });
}

module.exports = { maybeFileFallback };
