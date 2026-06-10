// B"H
/**
 * @module ProfileAggregator
 * @description
 * Chapter 59: The Awtsmoos gathers alias, template, posts, comments, palaces,
 * trees, stats, and recent activity into one public profile vessel.
 */

const { listTemplates } = require("./templates.js");
const { readProfileIdentity } = require("./readProfile.js");
const { profileHeichelos } = require("./heichelos.js");
const { postsByAlias } = require("./posts.js");
const { commentsByAlias } = require("./comments.js");
const { treeByAlias } = require("./tree.js");
const { profileStats } = require("./stats.js");
const { recentActivity } = require("./activity.js");

async function aggregateProfile({ $i, aliasId }) {
    const identity = await readProfileIdentity({ $i, aliasId });
    if (!identity) return null;
    const [posts, comments, heichelos, tree] = await Promise.all([
        postsByAlias({ $i, aliasId }),
        commentsByAlias({ $i, aliasId }),
        profileHeichelos($i, aliasId),
        treeByAlias({ $i, aliasId })
    ]);
    return {
        ...identity,
        templates: listTemplates(),
        stats: profileStats({ posts, comments, heichelos, tree }),
        posts,
        comments,
        heichelos,
        tree,
        seriesTree: tree,
        activity: recentActivity({ posts, comments }),
        pinned: posts.slice(0, 1)
    };
}

module.exports = { aggregateProfile, postsByAlias, commentsByAlias, treeByAlias, profileHeichelos };
