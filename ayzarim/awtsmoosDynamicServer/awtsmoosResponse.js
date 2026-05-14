
/**
 * B"H
 */

var di = require("./DependencyInjector.js");
var { matchDynamicRoute } = require("./routing/dynamicRouteMatcher.js");
var { childPathFor } = require("./routing/childPath.js");
var { recordAttempt } = require("./routing/attempts.js");
var { buildAwtsmoosResponse } = require("./response/buildAwtsmoosResponse.js");

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

  makeDidThisPath() {
    return {
      c: false,
      wow: {},
      m: {},
      time: new Date(),
      awtsmooseem: [],
      routeAttempts: [],
      matchedRoutes: []
    };
  }

  async doAwtsmooses({
    foundAwtsmooses,
    filePath,
    extraInfo = { fetchAwtsmoos: null }
  } = {}) {
    this.ended = false;

    var didThisPath = this.makeDidThisPath();

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
        var childPathUrl = childPathFor({ path, derech, filePath });

        didThisPath.moose = childPathUrl;

        var dynam = awts.dynamicRoutes || awts;

        if (typeof dynam !== "function") continue;

        var templateObject = await templateObjectGenerator.getTemplateObject({
          derech,
          private: () => this.makePrivate(didThisPath),
          ...extraInfo,
          use: async (route, func) => {
            return await this.handleDynamicRoutes(
              route,
              func,
              childPathUrl,
              didThisPath,
              otherDynamics
            );
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

        for (var od of otherDynamics) {
          if (od.doesMatch) {
            didThisPath.c = true;
            didThisPath.matchedRoutes.push({
              route: od.route,
              vars: od.vars,
              info: od.info
            });

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
      return await this.processDynamicRoute(route, func, childPathUrl, didThisPath, otherDynamics);
    }

    if (route && typeof route === "object") {
      for (var [rt, fnc] of Object.entries(route)) {
        var matches = await this.processDynamicRoute(rt, fnc, childPathUrl, didThisPath, otherDynamics);

        if (matches) return true;
      }
    }

    return false;
  }

  async processDynamicRoute(route, func, childPathUrl, didThisPath, otherDynamics) {
    var info = matchDynamicRoute(route, childPathUrl);

    recordAttempt(didThisPath, {
      route,
      childPathUrl,
      normalizedRoute: info.normalizedRoute,
      normalizedPath: info.normalizedPath,
      vars: info.vars,
      doesMatch: info.doesRouteMatchURL,
      reason: info.reason
    });

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

      return false;
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

      return false;
    }
  }

  getAwtsmoosDerechVariables(url, basePath) {
    return matchDynamicRoute(url, basePath);
  }

  async doAwtsmoosResponse(dyn, derechPath) {
    const { request } = templateObjectGenerator.dependencies;

    const built = await buildAwtsmoosResponse({
      dyn,
      derechPath,
      request,
      fs
    });

    this.ended = true;
    return built;
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
