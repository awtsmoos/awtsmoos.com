
/**
 * B"H
 */
var getPathInfo = require("./pathResolver.js");
var doFileResponse = require("./fileServer.js");
var { errorMessage } = require("./utils.js");

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
    if (context.fileName && context.fileName.startsWith("@")) {
      var tr = "/@/" + context.fileName.substring(1);
      var res = await context.fetchAwtsmoos(tr, { superSecret: true });

      if (res) {
        if (typeof res == "object") {
          res = JSON.stringify(res);
          response.setHeader("content-type", "application/json; charset=utf-8");
        }

        response.end(res);
        return;
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

  if (context.isDirectoryWithIndex) {
    context.contentType = "text/html";
  }

  var didThisPathAlready = false;

  if (request.method.toUpperCase() == "POST") await getPostData();
  if (request.method.toUpperCase() == "PUT") await getPutData();
  if (request.method.toUpperCase() == "DELETE") await getDeleteData();

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
      return errorMessage(context, {
        message: "Awtsmoos route engine crashed",
        code: "AWTSMOOS_ROUTE_ENGINE_CRASH",
        error: {
          message: e.message,
          stack: e.stack
        }
      });
    }
  }

  if (didThisPathAlready === false) {
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

  if (didThisPathAlready.error) {
    return errorMessage(context, {
      message: "actual error in route computation!",
      code: "ROUTE_ERROR",
      error: didThisPathAlready.error,
      more: {
        didThisPathAlready,
        logs: context.logs,
        foundAwtsmooses: context.foundAwtsmooses
      }
    });
  }

  if (didThisPathAlready.c) {
    var res = didThisPathAlready.responseInfo;

    if (res.statusResponse) {
      response.setHeader("Awtsmoos-File-Status", "true");
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(res.actualResponse.content);
      return;
    }

    try {
      response.setHeader("Vary", "Cookie");

      if (!res.actualResponse) {
        return errorMessage(context, {
          message: "No actual response",
          code: "NO_AC_RES",
          info: res,
          details: didThisPathAlready
        });
      }

      var ar = res.actualResponse;
      var con = null;

      if (Buffer.isBuffer(ar)) {
        con = ar;
      } else if (ar && Buffer.isBuffer(ar.content)) {
        con = ar.content;
      } else if (ar && ar.content !== undefined) {
        con = ar.content;
      } else {
        con = ar;
      }

      if (res.responseType) {
        response.setHeader("content-type", res.responseType);
      } else if (ar && ar.contentType) {
        response.setHeader("content-type", ar.contentType + "; charset=utf-8");
      }

      if (con || con === "" || con === "undefined" || con === "null") {
        if (Buffer.isBuffer(con)) {
          response.end(con);
          return;
        }

        if (typeof con === "object") {
          con = JSON.stringify(con);
        } else if (typeof con !== "string") {
          con += "";
        }

        response.end(con);
        return;
      }

      return errorMessage(context, {
        message: "No Awtsmoos Response",
        code: "NO_AWTS_RESP",
        con: typeof con
      });
    } catch (e) {
      return errorMessage(context, {
        message: "Problem sending Awtsmoos response",
        code: "SEND_AWTSMOOS_RESPONSE_FAILED",
        error: e.stack || String(e)
      });
    }
  }

  if (didThisPathAlready.invalidRoute) {
    return errorMessage(context, {
      message: "Invalid Route",
      code: "INVALID_ROUTE",
      more: {
        didThisPathAlready,
        routeAttempts: didThisPathAlready.routeAttempts || [],
        logs: context.logs,
        foundAwtsmooses: context.foundAwtsmooses
      }
    });
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
