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

const { listTemplates } = require("./templates.js");
const { readProfileIdentity } = require("./readProfile.js");
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
    const identity = await timedSection("identity", timings, () => readProfileIdentity({ $i, aliasId }));
    if (!identity) return null;
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
