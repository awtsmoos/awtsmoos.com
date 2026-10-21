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

async function aggregateProfile({ $i, aliasId }) {
    const profileStart = Date.now();
    const timings = {};
    let identity = await timedSection("identity", timings, () => readProfileIdentity({ $i, aliasId }));
    const [posts, comments, heichelos, tree, history] = await Promise.all([
        safeRecordRead("profile:" + aliasId + ":posts", () => timedSection("posts", timings, () => postsByAlias({ $i, aliasId })), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":comments", () => timedSection("comments", timings, () => commentsByAlias({ $i, aliasId })), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":heichelos", () => timedSection("heichelos", timings, () => profileHeichelos($i, aliasId)), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":tree", () => timedSection("tree", timings, () => treeByAlias({ $i, aliasId })), { fallback: [] }),
        safeRecordRead("profile:" + aliasId + ":history", () => timedSection("history", timings, () => getHistory({ $i, aliasId, limit: 40 })), { fallback: [] })
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
