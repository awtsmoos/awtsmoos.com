
// B"H

const { errorMessage } = require("../utils.js");

async function handleMissingPath(context) {
  const { response } = context.dependencies;

  if (context.fileName && context.fileName.startsWith("@")) {
    var tr = "/@/" + context.fileName.substring(1);
    var res = await context.fetchAwtsmoos(tr, { superSecret: true });

    if (res) {
      if (typeof res === "object") {
        res = JSON.stringify(res);
        response.setHeader("Content-Type", "application/json; charset=utf-8");
      }

      response.end(res);
      return true;
    }

    return errorMessage(context, {
      message: "Content empty",
      code: "EMPTY"
    });
  }

  return errorMessage(context, {
    message: "Dynamic route not found",
    code: "DYN_ROUTE_NOT_FOUND",
    info: {
      filePath: context.filePath
    },
    logs: context.logs
  });
}

module.exports = { handleMissingPath };
