// B"H
/**
 * @module SocialProfileRoutes
 * @description
 * Chapter 61: One profile gate now serves the clean mobile soul-map. Every tab
 * is API-first; every template is data; every owner write is guarded.
 */

const { er } = require("./helper/general.js");
const { listTemplates } = require("./helper/profile/templates.js");
const { aggregateProfile, postsByAlias, commentsByAlias, treeByAlias, profileHeichelos } = require("./helper/profile/index.js");
const { updateProfile, updateTemplate } = require("./helper/profile/writeProfile.js");

function is($i, method) {
    return $i.request.method === method;
}

function badMethod(message = "Bad method.") {
    return er({ code: "BAD_METHOD", message });
}

async function profileOrError($i, aliasId) {
    const profile = await aggregateProfile({ $i, aliasId });
    return profile || er({ code: "PROFILE_NOT_FOUND", message: `@${aliasId} was not found.` });
}

module.exports = ({ $i, userid } = {}) => ({
    "/profile/templates": async () => is($i, "GET") ? { success: listTemplates() } : badMethod("Use GET."),
    "/profile/:alias": async vars => is($i, "GET") ? await profileOrError($i, vars.alias) : badMethod("Use GET."),
    "/profile/:alias/posts": async vars => is($i, "GET") ? { success: await postsByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/comments": async vars => is($i, "GET") ? { success: await commentsByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/tree": async vars => is($i, "GET") ? { success: await treeByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/series-tree": async vars => is($i, "GET") ? { success: await treeByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/heichelos": async vars => is($i, "GET") ? { success: await profileHeichelos($i, vars.alias) } : badMethod("Use GET."),
    "/alias/:alias/profile": async vars => {
        if (is($i, "GET")) return await profileOrError($i, vars.alias);
        if (is($i, "POST") || is($i, "PUT")) return await updateProfile({ $i, userid, aliasId: vars.alias });
        return badMethod("Use GET, POST, or PUT.");
    },
    "/alias/:alias/profile/template": async vars => {
        if (is($i, "POST") || is($i, "PUT")) return await updateTemplate({ $i, userid, aliasId: vars.alias });
        return badMethod("Use POST or PUT.");
    }
});
