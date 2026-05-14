
/**
 * B"H
 */
var crypto = require("crypto");
var getProperContent = require("./getProperContent.js");
var di = require("./DependencyInjector.js");
var { matchDynamicRoute } = require("./routing/dynamicRouteMatcher.js");

let {
  self,
  errorMessage,
  path,
  fs,
  awtsMoosification,
  templateObjectGenerator
} = di.safeInit();

class AwtsmoosResponse {
  ended = false;

  constructor(vars) {
    ({
      self,
      errorMessage,
      path,
      fs,
      awtsMoosification,
      templateObjectGenerator
    } = vars);
  }

  makePrivate(didThisPath) {
    didThisPath.isPrivate = true;
  }

  async doAwtsmooses({
    foundAwtsmooses,
    filePath,
    extraInfo = { fetchAwtsmoos: null }
  } = {}) {
    this.ended = false;

    var didThisPath = {
      c: false,
      wow: {},
      m: {},
      time: new Date(),
      awtsmooseem: [],
      routeAttempts: []
    };

    if (filePath.includes("favicon")) {
      return didThisPath;
    }

    var otherDynamics = [];

    for (var awtsmoos of foundAwtsmooses) {
      didThisPath.awtsmooseem.push(awtsmoos);

      try {
        var derech = path.join(awtsmoos, awtsMoosification);
        didThisPath.derech = derech;

        var awts = require(derech);
        var modulePath = path.dirname(derech);
        var relativeChildPath = path.relative(modulePath, filePath);
        var childPathUrl = "/" + relativeChildPath.replace(/\\/g, "/");

        didThisPath.moose = childPathUrl;

        var dynam = awts.dynamicRoutes || awts;

        if (typeof dynam !== "function") {
          continue;
        }

        var templateObject = await templateObjectGenerator.getTemplateObject({
          derech,
          private: () => {
            this.makePrivate(didThisPath);
          },
          ...extraInfo,
          use: async (route, func) => {
            try {
              return await this.handleDynamicRoutes(
                route,
                func,
                childPathUrl,
                didThisPath,
                otherDynamics
              );
            } catch (e) {
              didThisPath.error = {
                message: "dynamic_route_use_failed",
                route,
                childPathUrl,
                stack: e.stack || String(e)
              };

              return false;
            }
          }
        });

        try {
          await dynam(templateObject);
        } catch (e) {
          didThisPath.error = {
            message: "dynamic_routes_function_failed",
            childPathUrl,
            stack: e.stack || String(e)
          };

          return didThisPath;
        }

        if (didThisPath.error) {
          return didThisPath;
        }

        for (var od of otherDynamics) {
          if (od.doesMatch) {
            didThisPath.c = true;

            try {
              var resp = await this.doAwtsmoosResponse(od.result, derech);
              didThisPath.responseInfo = resp;
            } catch (e) {
              didThisPath.error = {
                message: "awtsmoos_response_failed",
                stack: e.stack || String(e),
                matchedRoute: od.route,
                vars: od.vars
              };
            }

            return didThisPath;
          }
        }

        if (!didThisPath.c) {
          didThisPath.invalidRoute = true;
        } else if (didThisPath.isPrivate) {
          didThisPath.isPrivate = true;
        }

        return didThisPath;
      } catch (e) {
        didThisPath.error = {
          message: "awtsmoos_derech_failed",
          stack: e.stack || String(e),
          awtsmoos
        };

        return didThisPath;
      }
    }

    return didThisPath;
  }

  async handleDynamicRoutes(route, func, childPathUrl, didThisPath, otherDynamics) {
    if (typeof route === "string") {
      return await this.processDynamicRoute(
        route,
        func,
        childPathUrl,
        didThisPath,
        otherDynamics
      );
    }

    if (route && typeof route === "object") {
      for (var [rt, fnc] of Object.entries(route)) {
        var matches = await this.processDynamicRoute(
          rt,
          fnc,
          childPathUrl,
          didThisPath,
          otherDynamics
        );

        if (matches) {
          return true;
        }
      }
    }

    return false;
  }

  async processDynamicRoute(route, func, childPathUrl, didThisPath, otherDynamics) {
    var info = matchDynamicRoute(route, childPathUrl);

    var attempt = {
      route,
      childPathUrl,
      normalizedRoute: info.normalizedRoute,
      normalizedPath: info.normalizedPath,
      vars: info.vars,
      doesMatch: info.doesRouteMatchURL,
      reason: info.reason
    };

    didThisPath.routeAttempts.push(attempt);

    if (!info.doesRouteMatchURL) {
      otherDynamics.push({
        route,
        fullPath: "/" + info.normalizedPath,
        ProbablyDoesntMatch: true,
        info
      });

      return false;
    }

    if (typeof func !== "function") {
      didThisPath.error = {
        message: "matched_route_handler_not_function",
        route,
        childPathUrl,
        type: typeof func
      };

      throw new Error("Matched route handler is not a function for route: " + route);
    }

    try {
      var rez = await func(info.vars);

      otherDynamics.push({
        route,
        matches: true,
        shortRoute: route,
        result: rez,
        vars: info.vars,
        doesMatch: true,
        info
      });

      return true;
    } catch (e) {
      didThisPath.error = {
        message: "matched_route_handler_threw",
        route,
        childPathUrl,
        vars: info.vars,
        stack: e.stack || String(e)
      };

      throw e;
    }
  }

  getAwtsmoosDerechVariables(url, basePath) {
    return matchDynamicRoute(url, basePath);
  }

  async doAwtsmoosResponse(dyn, derechPath) {
    const { request } = templateObjectGenerator.dependencies;

    if (
      request.method == "GET" &&
      request.isAwtsmoosFileStatusRequest
    ) {
      const results = {
        logicModified: null,
        dataModified: null,
        stateHash: null
      };

      try {
        const logicStats = await fs.stat(derechPath);
        results.logicModified = logicStats.mtime.getTime();
      } catch (e) {}

      if (request.awtsmoosDataSourceStat) {
        results.dataModified = request.awtsmoosDataSourceStat.mtime.getTime();
      }

      const sessionCookie = request.cookies && request.cookies.awtsmoosKey;

      if (sessionCookie) {
        results.stateHash = crypto
          .createHash("sha256")
          .update(sessionCookie)
          .digest("hex");
      } else {
        results.stateHash = "awtsmoos-logged-out";
      }

      this.ended = true;

      return {
        responseType: "application/json",
        statusResponse: true,
        actualResponse: {
          content: JSON.stringify(results)
        }
      };
    }

    var responseType = "";
    var actualResponse = null;

    if (dyn === undefined) {
      return {
        responseType: "awtsmoos/undefined",
        actualResponse: {
          content: "undefined"
        }
      };
    }

    if (dyn === null) {
      return {
        responseType: "awtsmoos/null",
        actualResponse: {
          content: "null"
        }
      };
    }

    let responseBody = dyn.response !== undefined ? dyn.response : dyn;
    let mimeType = dyn.mimeType;

    if (mimeType && typeof mimeType === "string") {
      responseType = mimeType;
    }

    try {
      responseBody = getProperContent(responseBody, mimeType);
      this.ended = true;
      actualResponse = responseBody;
    } catch (e) {
      actualResponse = {
        content: JSON.stringify({
          BH: "B\"H",
          ok: false,
          error: "get_proper_content_failed",
          details: e.stack || String(e)
        })
      };

      responseType = "application/json";
    }

    return {
      responseType,
      actualResponse
    };
  }

  async getAwtsmoosInfo(sourcePath, parentPath) {
    var checkedPath = sourcePath;

    if (sourcePath.includes("favicon")) {
      return [];
    }

    let myFoundAwtsmooses = [];

    parentPath = path.normalize(parentPath)
      .replaceAll("\\", "/")
      .trim();

    let paths = path.normalize(checkedPath)
      .replaceAll("\\", "/")
      .trim()
      .split("/");

    async function checkAwtsmoosDracheem() {
      try {
        let derech = path.join(checkedPath + "/" + awtsMoosification);
        let moos = await fs.stat(derech);

        if (moos && !moos.isDirectory()) {
          myFoundAwtsmooses.push(checkedPath);
        }
      } catch (e) {
        if (e.code != "ENOENT") {
          console.log("Eror", e, checkedPath);
        }

        paths.pop();
        checkedPath = paths.join("/");

        if (paths.length && parentPath != checkedPath) {
          await checkAwtsmoosDracheem();
        }
      }
    }

    await checkAwtsmoosDracheem();

    return myFoundAwtsmooses;
  }
}

module.exports = AwtsmoosResponse;
