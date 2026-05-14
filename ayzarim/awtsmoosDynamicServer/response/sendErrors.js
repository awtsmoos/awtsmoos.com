
// B"H

function routeEngineCrash(e) {
  return {
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

module.exports = {
  routeEngineCrash,
  routeComputationError,
  invalidRoute
};
