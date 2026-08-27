// B"H
/**
 * @module SocialProfileRoutes
 * @description
 * Chapter 545: The old gates remain, and a new living-card gate opens under
 * canonical `/api/social`, gathering profile, presence, inbox, memory, graph,
 * relationships, and reputation into one civilization face.
 */

const { er } = require("./helper/general.js");
const { listTemplates } = require("./helper/profile/templates.js");
const { livingProfileCard } = require("./helper/profile/livingCard.js");
const {
    aggregateProfile, postsByAlias, commentsByAlias, treeByAlias,
    profileHeichelos, getHistory, recordHistory, clearHistory, recentActivity
} = require("./helper/profile/index.js");
const { updateProfile, updateTemplate } = require("./helper/profile/writeProfile.js");
const { openApiDoc } = require("./helper/profile/openapi.js");
const {
    apiMeta, batchProfiles, profileFeed, search, trending, recommendations,
    analytics, heichelDiscover, graph, bulk, events, listFollows, follow,
    unfollow, followers
} = require("./helper/profile/discovery.js");
const { getQuery, csv, ok, fail, paginate } = require("./helper/profile/apiTools.js");

function is($i, method) { return $i.request.method === method; }
function badMethod(message = "Bad method.") { return er({ code: "BAD_METHOD", message }); }
function aliases($i) { return csv(getQuery($i).aliases); }
function mergedInput($i) { return { ...(getQuery($i) || {}), ...($i.$_POST || {}) }; }
function paged(items, $i, defaults = {}) {
    const query = getQuery($i);
    const page = paginate(items, query, defaults);
    return ok(page.items, { query, pageInfo: page.pageInfo });
}
function okOrFail(result, $i) {
    if (result?.error) return fail(result.error.code || "REQUEST_ERROR", result.error.message || "Request failed.", result.error);
    return ok(result, { query: getQuery($i) });
}
function bulkInputOrError($i) {
    const input = mergedInput($i);
    if (Array.isArray(input.ops) || !input.ops) return null;
    try {
        const parsed = JSON.parse(input.ops);
        return Array.isArray(parsed) ? null : { code: "BAD_BULK_OPS", message: "ops must be an array." };
    } catch (error) {
        return { code: "BAD_BULK_JSON", message: "ops must be valid JSON.", details: String(error.message || error) };
    }
}
async function profileOrError($i, aliasId) {
    const reserved = await reservedProfileRoute($i, aliasId);
    if (reserved) return reserved;
    const profile = await aggregateProfile({ $i, aliasId });
    return profile || er({ code: "PROFILE_NOT_FOUND", message: `@${aliasId} was not found.` });
}
async function reservedProfileRoute($i, aliasId) {
    const query = getQuery($i);
    if (aliasId === "meta") return ok(apiMeta(), { query, extra: { compatibility: "profile-reserved" } });
    if (aliasId === "batch") return paged(await batchProfiles({ $i, aliases: aliases($i), query }), $i, { limit: 25, max: 50 });
    if (aliasId === "feed") return paged(await profileFeed({ $i, aliases: aliases($i), query }), $i, { limit: 25, max: 100 });
    return null;
}
async function activityForAlias({ $i, aliasId }) {
    const [posts, comments] = await Promise.all([postsByAlias({ $i, aliasId }), commentsByAlias({ $i, aliasId })]);
    return { success: recentActivity({ posts, comments, limit: 80 }) };
}
async function livingCardOrError({ $i, userid, aliasId }) {
    const card = await livingProfileCard({ $i, userid, aliasId });
    return card ? ok(card, { query: getQuery($i) }) : fail("PROFILE_NOT_FOUND", `@${aliasId} was not found.`);
}

module.exports = ({ $i, userid } = {}) => ({
    "/meta": async () => is($i, "GET") ? ok(apiMeta(), { query: getQuery($i) }) : badMethod("Use GET."),
    "/openapi.json": async () => is($i, "GET") ? ok(openApiDoc(), { query: getQuery($i), extra: { contentType: "application/openapi+json" } }) : badMethod("Use GET."),
    "/profiles/batch": async () => is($i, "GET") ? paged(await batchProfiles({ $i, aliases: aliases($i), query: getQuery($i) }), $i, { limit: 25, max: 50 }) : badMethod("Use GET."),
    "/profiles/:alias/living-card": async vars => is($i, "GET") ? await livingCardOrError({ $i, userid, aliasId: vars.alias }) : badMethod("Use GET."),
    "/profiles/:alias": async vars => {
        if (!is($i, "GET")) return badMethod("Use GET.");
        const data = await aggregateProfile({ $i, aliasId: vars.alias });
        return data ? ok(data, { query: getQuery($i) }) : fail("PROFILE_NOT_FOUND", `@${vars.alias} was not found.`);
    },
    "/profiles/:alias/activity": async vars => is($i, "GET") ? paged((await aggregateProfile({ $i, aliasId: vars.alias }))?.activity || [], $i, { limit: 25, max: 100 }) : badMethod("Use GET."),
    "/profiles/:alias/analytics": async vars => is($i, "GET") ? ok(await analytics({ $i, aliasId: vars.alias }), { query: getQuery($i) }) : badMethod("Use GET."),
    "/profiles/:alias/graph": async vars => is($i, "GET") ? ok(await graph({ $i, aliasId: vars.alias, query: getQuery($i) }), { query: getQuery($i) }) : badMethod("Use GET."),
    "/profiles/:alias/history": async vars => {
        if (is($i, "GET")) return paged(await getHistory({ $i, aliasId: vars.alias, limit: 200 }), $i, { limit: 25, max: 100 });
        if (is($i, "POST")) return ok(await recordHistory({ $i, aliasId: vars.alias, input: $i.$_POST || {} }), { query: getQuery($i) });
        if (is($i, "DELETE")) return ok(await clearHistory({ $i, aliasId: vars.alias }), { query: getQuery($i) });
        return fail("BAD_METHOD", "Use GET, POST, or DELETE.");
    },
    "/search": async () => is($i, "GET") ? paged(await search({ $i, query: getQuery($i) }), $i, { limit: 25, max: 100 }) : badMethod("Use GET."),
    "/feed": async () => is($i, "GET") ? paged(await profileFeed({ $i, aliases: aliases($i), query: getQuery($i) }), $i, { limit: 25, max: 100 }) : badMethod("Use GET."),
    "/trending": async () => is($i, "GET") ? paged(await trending({ $i, query: getQuery($i) }), $i, { limit: 25, max: 100 }) : badMethod("Use GET."),
    "/recommendations/:alias": async vars => is($i, "GET") ? paged(await recommendations({ $i, aliasId: vars.alias, query: getQuery($i) }), $i, { limit: 20, max: 100 }) : badMethod("Use GET."),
    "/follows/:alias": async vars => {
        if (is($i, "GET")) return paged(await listFollows({ $i, aliasId: vars.alias }), $i, { limit: 50, max: 200 });
        if (is($i, "POST")) return okOrFail(await follow({ $i, aliasId: vars.alias, input: mergedInput($i) }), $i);
        if (is($i, "DELETE")) return okOrFail(await unfollow({ $i, aliasId: vars.alias, input: mergedInput($i) }), $i);
        return fail("BAD_METHOD", "Use GET, POST, or DELETE.");
    },
    "/followers/:type/:id": async vars => is($i, "GET") ? paged(await followers({ $i, type: vars.type, id: vars.id }), $i, { limit: 50, max: 200 }) : badMethod("Use GET."),
    "/bulk": async () => {
        if (!is($i, "POST")) return fail("BAD_METHOD", "Use POST.");
        const bad = bulkInputOrError($i);
        if (bad) return fail(bad.code, bad.message, bad);
        return okOrFail(await bulk({ $i, input: mergedInput($i) }), $i);
    },
    "/events": async () => is($i, "GET") ? ok(await events({ $i, aliases: aliases($i), query: getQuery($i) }), { query: getQuery($i), extra: { stream: "json-event-stream-shape" } }) : badMethod("Use GET."),
    "/heichelos/discover": async () => is($i, "GET") ? paged(await heichelDiscover({ $i, query: getQuery($i) }), $i, { limit: 25, max: 100 }) : badMethod("Use GET."),
    "/profile/meta": async () => is($i, "GET") ? ok(apiMeta(), { query: getQuery($i), extra: { compatibility: "legacy-profile" } }) : badMethod("Use GET."),
    "/profile/batch": async () => is($i, "GET") ? paged(await batchProfiles({ $i, aliases: aliases($i), query: getQuery($i) }), $i, { limit: 25, max: 50 }) : badMethod("Use GET."),
    "/profile/feed": async () => is($i, "GET") ? paged(await profileFeed({ $i, aliases: aliases($i), query: getQuery($i) }), $i, { limit: 25, max: 100 }) : badMethod("Use GET."),
    "/profile/templates": async () => is($i, "GET") ? { success: listTemplates() } : badMethod("Use GET."),
    "/profile/:alias/posts": async vars => is($i, "GET") ? { success: await postsByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/comments": async vars => is($i, "GET") ? { success: await commentsByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/activity": async vars => is($i, "GET") ? await activityForAlias({ $i, aliasId: vars.alias }) : badMethod("Use GET."),
    "/profile/:alias/tree": async vars => is($i, "GET") ? { success: await treeByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/series-tree": async vars => is($i, "GET") ? { success: await treeByAlias({ $i, aliasId: vars.alias }) } : badMethod("Use GET."),
    "/profile/:alias/heichelos": async vars => is($i, "GET") ? { success: await profileHeichelos($i, vars.alias) } : badMethod("Use GET."),
    "/profile/:alias": async vars => is($i, "GET") ? await profileOrError($i, vars.alias) : badMethod("Use GET."),
    "/alias/:alias/history": async vars => {
        if (is($i, "GET")) return { success: await getHistory({ $i, aliasId: vars.alias }) };
        if (is($i, "POST")) return await recordHistory({ $i, aliasId: vars.alias, input: $i.$_POST || {} });
        if (is($i, "DELETE")) return await clearHistory({ $i, aliasId: vars.alias });
        return badMethod("Use GET, POST, or DELETE.");
    },
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
