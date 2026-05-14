
// B"H

const { normalizeRoutePath, splitPath } = require("./pathTools.js");

function matchDynamicRoute(routePattern, childPathUrl) {
  const routeSegments = splitPath(routePattern);
  const pathSegments = splitPath(childPathUrl);
  const vars = {};

  if (routeSegments.length !== pathSegments.length) {
    return {
      doesRouteMatchURL: false,
      vars,
      normalizedRoute: normalizeRoutePath(routePattern),
      normalizedPath: normalizeRoutePath(childPathUrl),
      reason: "segment_length_mismatch"
    };
  }

  for (let i = 0; i < routeSegments.length; i++) {
    const routePart = routeSegments[i];
    const pathPart = pathSegments[i];

    if (routePart.startsWith(":")) {
      const key = routePart.slice(1);

      if (!key) {
        return {
          doesRouteMatchURL: false,
          vars,
          normalizedRoute: normalizeRoutePath(routePattern),
          normalizedPath: normalizeRoutePath(childPathUrl),
          reason: "empty_param_name"
        };
      }

      vars[key] = pathPart;
      continue;
    }

    if (routePart !== pathPart) {
      return {
        doesRouteMatchURL: false,
        vars,
        normalizedRoute: normalizeRoutePath(routePattern),
        normalizedPath: normalizeRoutePath(childPathUrl),
        reason: "literal_mismatch",
        routePart,
        pathPart
      };
    }
  }

  return {
    doesRouteMatchURL: true,
    vars,
    normalizedRoute: normalizeRoutePath(routePattern),
    normalizedPath: normalizeRoutePath(childPathUrl),
    reason: "matched"
  };
}

module.exports = {
  matchDynamicRoute
};
