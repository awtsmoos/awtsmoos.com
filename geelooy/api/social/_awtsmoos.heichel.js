/**
 * B"H
 * @module SocialHeichelRoutes
 * @description Chapter 522: the palace gate is smaller, clearer, and safer.
 */
var {
  createHeichel, getHeichel, getHeichelos, generateHeichelId,
  addHeichelEditor, removeHeichelEditor, getHeichelEditors,
  deleteHeichel, updateHeichel, er, verifyHeichelAuthority
} = require("./helper/index.js");
var {
  getHeichelRoleList, addHeichelRoleMember, removeHeichelRoleMember,
  getHeichelSubmissionSettings, updateHeichelSubmissionSettings
} = require("./helper/heichelRoles.js");
var { awtsmoosError, methodNotAllowed, requireArray } = require("./helper/response/routeResponses.js");
var { makeHeichelRouteTools } = require("./helper/heichelRoutes/routeTools.js");
var { getAliasIDs } = require("./helper/alias.js");

module.exports = ({ $i, userid } = {}) => {
  var tools = makeHeichelRouteTools({
    getHeichel, getHeichelos, createHeichel, deleteHeichel,
    verifyHeichelAuthority, er, requireArray, awtsmoosError
  });
  var method = () => $i.request.method;
  var unsupported = allowed => methodNotAllowed(method(), allowed);
  // B"H 2026-11-20 round 2: normalizes getAliasIDs' stored shape (array
  // of ids, array of records, or an id-keyed map) into a plain id list.
  function ownAliasIds(value) {
    if (Array.isArray(value)) {
      return value
        .map(item => (item && typeof item === "object") ? (item.id || item.aliasId || "") : item)
        .map(String)
        .filter(Boolean);
    }
    if (value && typeof value === "object") return Object.keys(value).filter(Boolean);
    return [];
  }
  return {
    "/heichelos/mine/details": async vars => {
      if (method() != "GET") return unsupported(["GET"]);
      if (!userid) return er({ code: "NOT_LOGGED_IN", message: "You are not logged in." });
      // B"H 2026-11-20 round 2: ONE bounded aggregate behind the
      // profile dashboard's Heichelos tab. The tab used to fan out one
      // /alias/:alias/heichelos/details request per alias (46 for a
      // large account), each an independent cold walk, so under load
      // every leg timed out and the tab rendered 46 error cards. Here
      // the same per-alias lists are walked server-side, 4 at a time,
      // behind the profile read memo (routeTools memoizes
      // detailedHeichelList for 45s with in-flight coalescing), under
      // a 25s soft deadline: an alias that misses the deadline comes
      // back as a per-alias error entry — the tab stays honest — and
      // its walk keeps warming the memo in the background, so the
      // next view is fast.
      const aliasIds = ownAliasIds(await getAliasIDs({ $i, userID: userid }));
      const groups = new Array(aliasIds.length);
      let next = 0;
      const workers = Array.from({ length: Math.max(1, Math.min(4, aliasIds.length)) }, async () => {
        while (next < aliasIds.length) {
          const index = next++;
          const aliasId = aliasIds[index];
          try {
            groups[index] = { aliasId, heichelos: await tools.detailedHeichelList({ $i, aliasId }) };
          } catch (e) {
            groups[index] = { aliasId, error: "Heichelos could not load for this alias." };
          }
        }
      });
      await Promise.race([
        Promise.all(workers),
        new Promise(resolve => setTimeout(resolve, 25000))
      ]);
      for (let k = 0; k < aliasIds.length; k++) {
        if (!groups[k]) groups[k] = { aliasId: aliasIds[k], error: "Heichelos timed out for this alias." };
      }
      return { groups };
    },
    "/heichelos/:heichel/roles/:role": async vars => {
      if (method() == "GET") return await getHeichelRoleList({ $i, heichelId: vars.heichel, role: vars.role });
      if (method() == "POST") return await addHeichelRoleMember({ $i, heichelId: vars.heichel, role: vars.role });
      if (method() == "DELETE") return await removeHeichelRoleMember({ $i, heichelId: vars.heichel, role: vars.role });
      return unsupported(["GET", "POST", "DELETE"]);
    },
    "/heichelos/:heichel/settings/submissions": async vars => {
      if (method() == "GET") return await getHeichelSubmissionSettings({ $i, heichelId: vars.heichel });
      if (method() == "POST" || method() == "PUT") return await updateHeichelSubmissionSettings({ $i, heichelId: vars.heichel });
      return unsupported(["GET", "POST", "PUT"]);
    },
    "/heichelActions/generateHeichelId": async () => {
      if (method() != "GET" && method() != "POST") return unsupported(["GET", "POST"]);
      return await generateHeichelId({ $i });
    },
    "/heichelos/:heichel/editors": async vars => {
      if (method() == "GET") return await getHeichelEditors({ $i, heichelId: vars.heichel });
      if (method() == "POST") return await addHeichelEditor({ $i, heichelId: vars.heichel });
      if (method() == "DELETE") return await removeHeichelEditor({ $i, heichelId: vars.heichel });
      return unsupported(["GET", "POST", "DELETE"]);
    },
    "/heichelos/:heichel": async vars => {
      var aliasId = $i.$_DELETE?.aliasId || $i.$_POST?.aliasId || $i.$_PUT?.aliasId || $i.$_GET?.aliasId;
      if (method() == "DELETE") return await tools.deleteHeichelForAlias({ $i, heichelId: vars.heichel, aliasId });
      if (method() == "POST") return await tools.createHeichelForAlias({ $i, aliasId });
      if (method() == "PUT") return await updateHeichel({ vars, $i });
      if (method() == "GET") return await getHeichel({ heichelId: vars.heichel, $i, er });
      return unsupported(["GET", "POST", "PUT", "DELETE"]);
    },
    "/alias/:alias/heichelos": async vars => {
      if (method() == "GET") return (await tools.detailedHeichelList({ $i, aliasId: vars.alias })).map(w => w.id);
      if (method() == "POST") return await tools.createHeichelForAlias({ $i, aliasId: vars.alias });
      return unsupported(["GET", "POST"]);
    },
    "/alias/:alias/heichelos/details": async vars => {
      if (method() == "POST") return await tools.heichelDetailsByIds({ $i, heichelIds: $i.$_POST.heichelIds });
      if (method() == "GET") return await tools.detailedHeichelList({ $i, aliasId: vars.alias });
      return unsupported(["GET", "POST"]);
    },
    "/alias/:alias/heichelos/:heichel": async vars => {
      if (method() == "DELETE") return await tools.deleteHeichelForAlias({ $i, heichelId: vars.heichel, aliasId: vars.alias });
      if (method() == "PUT") return await updateHeichel({ vars, $i });
      if (method() == "GET") return await getHeichel({ heichelId: vars.heichel, $i, er });
      return unsupported(["GET", "PUT", "DELETE"]);
    },
    "/heichelos/searchByAliasOwner/:aliasId": async vars => {
      if (method() == "GET") return await tools.detailedHeichelList({ $i, aliasId: vars.aliasId });
      return unsupported(["GET"]);
    },
    "/alias/:alias/heichelos/:heichel/ownership": async vars => {
      if (method() != "GET") return unsupported(["GET"]);
      try {
        var owns = await verifyHeichelAuthority({ heichelId: vars.heichel, aliasId: vars.alias, $i });
        return owns ? { yes: "You have permission to post to this heichel!", code: "YES" } : { no: "You don't have permission to post to this heichel!", code: "NO" };
      } catch (e) { return awtsmoosError({ code: "OWNERSHIP_CHECK_FAILED", message: e + "" }); }
    }
  };
};
