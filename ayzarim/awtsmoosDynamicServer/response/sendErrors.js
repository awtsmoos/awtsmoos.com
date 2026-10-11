
// B"H

function routeEngineCrash(e) {
  return {
    statusCode: 500,
    message: "Awtsmoos route engine crashed",
    code: "AWTSMOOS_ROUTE_ENGINE_CRASH",
    error: {
      message: e.message,
      stack: e.stack
    }
  };
}

function routeComputationError(didThisPathAlready, context) {
  // B"H 2026-10-11 (Yaakov standing rule: meaningful API errors, not bare
  // BAD_RESPONSE). Surface the underlying exception's MESSAGE publicly so a
  // 500 is diagnosable from the client. Stacks, route attempts, and logs
  // stay private in `error`/`more` (stripped by the public boundary).
  var inner = didThisPathAlready && didThisPathAlready.error;
  var detail = "";
  try {
    detail = String((inner && inner.message) || inner || "").slice(0, 300);
  } catch (_) { detail = ""; }
  return {
    statusCode: 500,
    message: detail ? "Route error: " + detail : "actual error in route computation!",
    code: "ROUTE_ERROR",
    error: didThisPathAlready.error,
    more: {
      didThisPathAlready,
      routeAttempts: didThisPathAlready.routeAttempts || [],
      logs: context.logs,
      foundAwtsmooses: context.foundAwtsmooses
    }
  };
}

function invalidRoute(didThisPathAlready, context) {
  return {
    statusCode: 404,
    message: "Invalid Route",
    code: "INVALID_ROUTE",
    more: {
      didThisPathAlready,
      routeAttempts: didThisPathAlready.routeAttempts || [],
      logs: context.logs,
      foundAwtsmooses: context.foundAwtsmooses
    }
  };
}

function noActualResponse(info) {
  return {
    statusCode: 500,
    message: "No actual response",
    code: "NO_ACTUAL_RESPONSE",
    info
  };
}

module.exports = {
  routeEngineCrash,
  routeComputationError,
  invalidRoute,
  noActualResponse
};
