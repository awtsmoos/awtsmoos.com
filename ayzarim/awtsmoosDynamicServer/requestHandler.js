
/**
 * B"H
 */

var getPathInfo = require("./pathResolver.js");
var { errorMessage } = require("./utils.js");
var { sendAwtsmoosResponse } = require("./response/sendAwtsmoosResponse.js");
var {
  routeEngineCrash,
  routeComputationError,
  invalidRoute,
  noActualResponse
} = require("./response/sendErrors.js");
var { readBodyIfNeeded } = require("./request/bodyReaders.js");
var { handleMissingPath } = require("./request/missingPath.js");
var { maybeFileFallback } = require("./request/fileFallback.js");

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

  await readBodyIfNeeded({
    request,
    getPostData,
    getPutData,
    getDeleteData
  });

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
      return errorMessage(context, noActualResponse({
        responseInfo: didThisPathAlready.responseInfo,
        didThisPathAlready
      }));
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
