
// B"H

/**
 * B"H
 * Robust dynamic route matching for Awtsmoos dynamic server.
 *
 * Goals:
 * - query strings never affect dynamic route matching
 * - /authorize, authorize, /authorize/ all normalize sanely
 * - :params work
 * - route handler errors do not get disguised as INVALID_ROUTE
 */

function stripQueryAndHash(value) {
  return String(value || "").split("?")[0].split("#")[0];
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

function normalizeRoutePath(value) {
  let s = safeDecode(stripQueryAndHash(value));

  s = s.replace(/\\/g, "/");
  s = s.replace(/\/+/g, "/");
  s = s.trim();

  if (s === "." || s === "") return "";

  s = s.replace(/^\/+/, "");
  s = s.replace(/\/+$/, "");

  return s;
}

function splitPath(value) {
  const normalized = normalizeRoutePath(value);

  if (!normalized) return [];

  return normalized.split("/").filter(Boolean);
}

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
  stripQueryAndHash,
  normalizeRoutePath,
  splitPath,
  matchDynamicRoute
};
