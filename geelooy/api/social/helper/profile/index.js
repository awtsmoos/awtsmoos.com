// B"H
/**
 * @module ProfileAggregator
 * @description
 * Chapter 418: The alias becomes a small social universe.
 *
 * Posts, comments, Heichelos, tree, activity, and private return-history now
 * gather into one profile vessel. The public story is visible, while the
 * history stream is alias-scoped so the logged-in user can resume their path.
 */

const { listTemplates, getTemplate } = require("./templates.js");
const { readProfileIdentity, readProfile } = require("./readProfile.js");
const { profileHeichelos } = require("./heichelos.js");
const { postsByAlias } = require("./posts.js");
const { commentsByAlias } = require("./comments.js");
const { treeByAlias } = require("./tree.js");
const { profileStats } = require("./stats.js");
const { recentActivity } = require("./activity.js");
const { getHistory, recordHistory, clearHistory } = require("./history.js");
// B"H 2026-10-20 (safeguards): section isolation — a poison sub-read
// degrades its own section (empty fallback) instead of rejecting the
// whole Promise.all and killing the profile page.
const { safeRecordRead } = require("../safeguards/safeRecordRead.js");
const { perfLine } = require("../packed/perfLog.js");

/**
 * B"H 2026-10-20 (impl continuation-2): times one aggregateProfile
 * section so the journal shows which sub-read eats a slow feed call.
 * Observation only — the wrapped value passes through untouched.
 */
async function timedSection(label, timings, thunk) {
    const start = Date.now();
    try { return await thunk(); }
    finally { timings[label] = Date.now() - start; }
}

/**
 * B"H 2026-11-20 (profile data-layer fix): one slow section must
 * never hold the whole profile hostage. Each section races a soft
 * deadline; on deadline the section resolves to its fallback WITHOUT
 * raising an error, so safeRecordRead's poison quarantine (2 errors
 * = the path is skipped forever, persisted across restarts) is never
 * tripped by mere slowness. The underlying read keeps running and,
 * through the section memos in readCache.js, warms the next request.
 * Before this, one aggregate measured 55.6s under load — past the
 * proxy timeout, so the alias page and dashboard died whole instead
 * of rendering with one section missing.
 */
const SECTION_DEADLINE_MS = 20000;
function withSectionDeadline(thunk, fallback) {
    let timer;
    const deadline = new Promise(resolve => {
        timer = setTimeout(() => resolve(fallback), SECTION_DEADLINE_MS);
        if (typeof timer.unref === "function") timer.unref();
    });
    return Promise.race([Promise.resolve().then(thunk), deadline])
        .finally(() => clearTimeout(timer));
}

async function aggregateProfile({ $i, aliasId, postsFetchLimit, commentsFetchLimit }) {
    const profileStart = Date.now();
    const timings = {};
    let identity = await timedSection("identity", timings, () => readProfileIdentity({ $i, aliasId }));
    const [posts, comments, heichelos, tree, history] = await Promise.all([
        safeRecordRead("profile:" + aliasId + ":posts", () => timedSection("posts", timings, () => withSectionDeadline(() => postsByAlias({ $i, aliasId, ...(postsFetchLimit != null ? { limit: postsFetchLimit } : {}) }), [])), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":comments", () => timedSection("comments", timings, () => withSectionDeadline(() => commentsByAlias({ $i, aliasId, ...(commentsFetchLimit != null ? { limit: commentsFetchLimit } : {}) }), [])), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":heichelos", () => timedSection("heichelos", timings, () => withSectionDeadline(() => profileHeichelos($i, aliasId), [])), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":tree", () => timedSection("tree", timings, () => withSectionDeadline(() => treeByAlias({ $i, aliasId }), [])), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":history", () => timedSection("history", timings, () => withSectionDeadline(() => getHistory({ $i, aliasId, limit: 40 }), [])), { fallback: [] })
    ]);
    perfLine("profile alias=" + aliasId + " totalMs=" + (Date.now() - profileStart) +
        " identity=" + (timings.identity || 0) + " posts=" + (timings.posts || 0) +
        " comments=" + (timings.comments || 0) + " heichelos=" + (timings.heichelos || 0) +
        " tree=" + (timings.tree || 0) + " history=" + (timings.history || 0));
    if (!identity) {
        // B"H 2026-10-20 (impl phase 3, wart iii): content-author aliases
        // (theRebbe, awtsmoos, imported @alias commentators and prefixed
        // backend ids like ikar-penei-moshe) often have posts/comments but
        // no alias-info record, so the identity gate failed the WHOLE
        // profile as PROFILE_NOT_FOUND and the feed silently skipped them.
        // A real content footprint earns a synthesized identity shell;
        // footprint-less ids keep the honest null (route -> 404).
        const hasFootprint = posts.length > 0 || comments.length > 0 || heichelos.length > 0 || tree.length > 0;
        if (!hasFootprint) return null;
        const alias = { id: aliasId, name: aliasId, description: "", user: "" };
        const profile = await readProfile($i, aliasId, alias);
        identity = { alias, profile, activeTemplate: getTemplate(profile.templateId), synthetic: true };
    }
    const activity = recentActivity({ posts, comments, limit: 40 });
    return {
        ...identity,
        templates: listTemplates(),
        stats: profileStats({ posts, comments, heichelos, tree }),
        posts,
        comments,
        heichelos,
        tree,
        seriesTree: tree,
        activity,
        history,
        pinned: posts.slice(0, 1),
        dashboard: {
            continueReading: history.slice(0, 6),
            recentActivity: activity.slice(0, 8),
            recentPosts: posts.slice(0, 8),
            recentComments: comments.slice(0, 8)
        }
    };
}

module.exports = {
    aggregateProfile,
    postsByAlias,
    commentsByAlias,
    treeByAlias,
    profileHeichelos,
    getHistory,
    recordHistory,
    clearHistory,
    recentActivity
};
