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

async function aggregateProfile({ $i, aliasId }) {
    const identity = await readProfileIdentity({ $i, aliasId });
    if (!identity) return null;
    const [posts, comments, heichelos, tree, history] = await Promise.all([
        postsByAlias({ $i, aliasId }),
        commentsByAlias({ $i, aliasId }),
        profileHeichelos($i, aliasId),
        treeByAlias({ $i, aliasId }),
        getHistory({ $i, aliasId, limit: 40 })
    ]);
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
