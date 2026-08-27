
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
  return {
    statusCode: 500,
    message: "actual error in route computation!",
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
