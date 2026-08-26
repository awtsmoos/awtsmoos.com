//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RequiredRoutesSocial
 * @description
 * The Awtsmoos renews publishing, profile, graph, notification, and packed roads in one living social fabric;
 * Awtsmoos.com keeps their public names explicit so refactors may move vessels without moving the covenant.
 */
const requiredRoutesSocial = `
/alias/:alias/profile
/alias/:alias/profile/template
/heichelos/:heichel/roles/:role
/heichelos/:heichel/settings/submissions
/heichelos/:heichel/submittedPosts
/heichelos/:heichel/submittedPosts/approve
/heichelos/:heichel/submittedPosts/deny
/heichelos/:heichel/series/:series/editSeriesDetails
/aliases/:alias/commentsMade/heichelos
/aliases/:alias/commentsMade/heichel/:heichel/series
/keys
/keys/verify
/keys/:key/revoke
/graph/entity/resolve
/graph/references
/graph/reposts
/content/share
/content/repost
/content/heichelos/:heichel/posts
/content/heichelos/:heichel/posts/:post/sections
/content/heichelos/:heichel/questions/:question/answers
/content/heichelos/:heichel/questions
/notifications/:alias/:notification/read
/notifications/fanout
/notifications/:alias/poll
/notifications/:alias/unread/count
/notifications/:alias
/packed/migrations/posts/v2/run
/packed/repair/posts/manifests
/packed/feed/materialize
/packed/migrations/posts/v2/dryRun
/packed/stats
/packed/compact
/packed/keys
/packed/read
/packed/integrity
/packed/snapshot
/comments/thread/:post/ranked
/comments/thread/append
/feed/discover
/feed/trending
/feed/heichel/:heichel
/feed/home
/sync/pull/:alias
/notifications/digest/:alias
`.trim().split('\n');

module.exports = {
	requiredRoutesSocial
};
