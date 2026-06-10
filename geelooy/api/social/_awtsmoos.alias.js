/**
 * B"H
 * @module SocialAliasRoutes
 * @description
 * Chapter 6: The Awtsmoos gives every profile two gates with one soul.
 *
 * Older helper code asks `/api/social/aliases/:alias/ownership` while newer
 * browser code asks `/api/social/alias/:alias/ownership`. Both now resolve to
 * the same ownership oracle, so Heichel creation from a profile no longer gets
 * lost between singular and plural doors.
 */

var { NO_LOGIN, sp } = require("./helper/_awtsmoos.constants.js");
var { loggedIn, sortArray, er } = require("./helper/general.js");
var {
    getAlias,
    verifyAlias,
    deleteAlias,
    verifyAliasOwnership,
    getDetailedAlias,
    getAliasesDetails,
    createNewAlias,
    getAliasIDs,
    updateAlias,
    generateAliasId,
    getDefaultAlias,
    setDefaultAlias
} = require("./helper/alias.js");

function requireLogin($i) {
    return loggedIn($i) ? null : er(NO_LOGIN);
}

async function ownershipResponse({ aliasId, $i, userid }) {
    var owns = await verifyAliasOwnership(aliasId, $i, userid);
    return owns ? { yes: "You own this!", code: "YES" } : { no: "You don't own it!", code: "NO" };
}

async function createAliasSafely({ $i, userid }) {
    try {
        return await createNewAlias({ $i, sp, userid });
    } catch (e) {
        return er({ message: e.message || e + "", code: "ALIAS_CREATE_FAILED" });
    }
}

async function deleteAliasSafely({ $i, userid, aliasId }) {
    try {
        return await deleteAlias({ $i, userid, sp, verifyAlias, aliasId });
    } catch (e) {
        return er({ message: e.message || "Couldn't delete", code: "NO_DEL" });
    }
}

async function aliasEntityRoute({ $i, userid, aliasId, userScoped = false }) {
    if ($i.request.method == "DELETE") {
        var noLogin = requireLogin($i);
        if (noLogin) return noLogin;
        return await deleteAliasSafely({ $i, userid, aliasId });
    }
    if ($i.request.method == "PUT") {
        var noLoginPut = requireLogin($i);
        if (noLoginPut) return noLoginPut;
        return await updateAlias({ $i, userid, aliasId, verifyAliasOwnership });
    }
    return await getAlias(aliasId, $i);
}

module.exports = ({ $i, userid } = {}) => ({
    "/alias/default": async () => {
        if ($i.request.method == "GET") return await getDefaultAlias({ $i, userid });
        if ($i.request.method == "POST") return await setDefaultAlias({ $i, userid });
        return "What is it?";
    },

    "/user/:user/aliases": async v => {
        if ($i.request.method == "GET") return await getAliasIDs({ $i, userID: v.user });
        if ($i.request.method == "POST") return await createAliasSafely({ $i, userid });
    },

    "/user/:user/aliases/details": async v => {
        return await getAliasesDetails({ $i, sp, userID: v.user });
    },

    "/user/:user/aliases/:alias": async vars => {
        return await aliasEntityRoute({ $i, userid, aliasId: vars.alias, userScoped: true });
    },

    "/user/:user/aliases/:alias/details": async v => {
        return await getDetailedAlias({ $i, aliasId: v.alias, userID: v.user, sp });
    },

    "/aliases/checkOrGenerateId": async () => {
        var noLogin = requireLogin($i);
        if (noLogin) return noLogin;
        if ($i.request.method == "POST") {
            try {
                return await generateAliasId({ $i, sp, userid });
            } catch (e) {
                return er({ error: e + "", code: "500 INTERNAL" });
            }
        }
        return { message: "Use POST with inputId to check and/or aliasName to generate new" };
    },

    "/aliases": async () => {
        var noLogin = requireLogin($i);
        if (noLogin) return noLogin;
        if ($i.request.method == "GET") return await getAliasIDs({ $i, userID: userid });
        if ($i.request.method == "POST") return await createAliasSafely({ $i, userid });
    },

    "/aliases/details": async () => {
        var noLogin = requireLogin($i);
        if (noLogin) return noLogin;
        return sortArray(await getAliasesDetails({ $i, sp, userID: userid }));
    },

    "/alias/:alias/ownership": async vars => {
        return await ownershipResponse({ aliasId: vars.alias, $i, userid });
    },

    "/aliases/:alias/ownership": async vars => {
        return await ownershipResponse({ aliasId: vars.alias, $i, userid });
    },

    "/alias/:alias": async vars => {
        return await aliasEntityRoute({ $i, userid, aliasId: vars.alias });
    },

    "/aliases/:alias": async vars => {
        return await aliasEntityRoute({ $i, userid, aliasId: vars.alias });
    },

    "/alias/:alias/details": async v => {
        var details = await getDetailedAlias({ $i, aliasId: v.alias, userID: null });
        return details || er({ code: "PROBLEM_WITH_ALIAS" });
    },

    "/aliases/:alias/details": async v => {
        var details = await getDetailedAlias({ $i, aliasId: v.alias, userID: null });
        return details || er({ code: "PROBLEM_WITH_ALIAS" });
    }
});
