
/**
 * B"H
 */

var getPathInfo = require("./pathResolver.js");
var doFileResponse = require("./fileServer.js");
var { errorMessage } = require("./utils.js");
var { sendAwtsmoosResponse } = require("./response/sendAwtsmoosResponse.js");
var {
  routeEngineCrash,
  routeComputationError,
  invalidRoute
} = require("./response/sendErrors.js");

async function readBodyIfNeeded({ request, getPostData, getPutData, getDeleteData }) {
  const method = request.method.toUpperCase();

  if (method == "POST") await getPostData();
  if (method == "PUT") await getPutData();
  if (method == "DELETE") await getDeleteData();
}

async function handleMissingPath(context) {
  const { response } = context.dependencies;

  if (context.fileName && context.fileName.startsWith("@")) {
    var tr = "/@/" + context.fileName.substring(1);
    var res = await context.fetchAwtsmoos(tr, { superSecret: true });

    if (res) {
      if (typeof res == "object") {
        res = JSON.stringify(res);
        response.setHeader("content-type", "application/json; charset=utf-8");
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

async function doEverything(context) {
  var {
    awtsRes,
    response,
    request,
    getPostData,
    getPutData,
    getDeleteData
  } = context.dependencies;

  var iExist = await getPathInfo(context);

  if (awtsRes.ended) return;

  if (!iExist) {
    return await handleMissingPath(context);
  }

  if (context.isDirectoryWithIndex) {
    context.contentType = "text/html";
  }

  await readBodyIfNeeded({ request, getPostData, getPutData, getDeleteData });

  var didThisPathAlready = false;

  if (context.foundAwtsmooses.length && !context.isDirectoryWithIndex) {
    try {
      didThisPathAlready = await awtsRes.doAwtsmooses({
        foundAwtsmooses: context.foundAwtsmooses,
        filePath: context.filePath,
        extraInfo: {
          fetchAwtsmoos: context.fetchAwtsmoos
        }
      });
    } catch (e) {
      return errorMessage(context, routeEngineCrash(e));
    }
  }

  if (didThisPathAlready === false) {
    return await maybeFileFallback(context, didThisPathAlready);
  }

  if (didThisPathAlready.error) {
    return errorMessage(context, routeComputationError(didThisPathAlready, context));
  }

  if (didThisPathAlready.c) {
    var sent = sendAwtsmoosResponse({
      response,
      res: didThisPathAlready.responseInfo
    });

    if (!sent) {
      return errorMessage(context, {
        message: "No actual response",
        code: "NO_AC_RES",
        info: didThisPathAlready.responseInfo,
        details: didThisPathAlready
      });
    }

    return;
  }

  if (didThisPathAlready.invalidRoute) {
    return errorMessage(context, invalidRoute(didThisPathAlready, context));
  }

  if (didThisPathAlready.isPrivate) {
    return errorMessage(context, {
      message: "That's a private route",
      code: "PRIVATE_ROUTE"
    });
  }

  return errorMessage(context, {
    message: "Did not find route",
    code: "NOT_FOUND",
    more: {
      didThisPathAlready,
      logs: context.logs,
      foundAwtsmooses: context.foundAwtsmooses
    }
  });
}

module.exports = doEverything;
