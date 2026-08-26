//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RequiredRoutesCore
 * @description
 * The Awtsmoos renews the core social roads before any scanner can count them;
 * Awtsmoos.com preserves this explicit covenant so modular source movement never silently erases a public doorway.
 */
const requiredRoutesCore = `
/node-os/path
/node-os/nodes/:node
/node-os/nodes/:node/children
/node-os/nodes
/node-os/mount/entity/:type/:id
/node-os/mount/assets/:alias
/node-os/migrations/dry-run
/node-os/migrations/run
/mail/universe/mirror
/mail/universe/:thread/link
/entities/universe
/entities/universe/:type/:id
/entities/universe/:type/:id/children
/entities/universe/:type/:id/edges
/entities/universe/:type/:id/range-reference/preview
/entities/universe/:type/:id/range-reference/attach
/entities/universe/:type/:id/snapshot
/entities/universe/:type/:id/fork
/entities/universe/:type/:id/dna
/assets/:alias/upload
/assets/:alias
/assets/:alias/:asset/bind
/assets/:alias/manifest/:asset
/assets/:alias/:kind/:asset
/editor/posts/drafts
/editor/posts/drafts/:alias/:draft
/editor/posts/drafts/publish
/editor/heichelos/:heichel/posts/:post/verses/:verse/delete-preview
/editor/heichelos/:heichel/posts/:post/verses/:verse
/editor/heichelos/:heichel/posts/:post/subsections/:subsection/delete-preview
/editor/heichelos/:heichel/posts/:post/subsections/:subsection
/heichelos/:heichel/posts/:post/comment-tree
/heichelos/:heichel/questions/:question/comment-tree
/heichelos/:heichel/answers/:answer/comment-tree
/heichelos/:heichel/posts/:post/comments/:comment
/heichelos/:heichel/posts/:post/comments/:comment/replies
/heichelos/:heichel/posts/:post/comments/:comment/sections/:section/replies
/entities/:heichel/:entity/comment-tree
/entities/:heichel/:entity/comments/:comment/replies
/entities/:heichel/:entity/comments/:comment/sections/:section/replies
/comments/url/:comment
/heichelos/:heichel/posts/:post/verses/:verse/comments
/heichelos/:heichel/posts/:post/subsections/:subsection/comments
/heichelos/:heichel/settings/full
/heichelos/:heichel/members
/heichelos/:heichel/invites
/heichelos/:heichel/invites/:invite/accept
/heichelos/:heichel/submissions/full
/heichelos/:heichel/submissions/:submission/approve
/heichelos/:heichel/submissions/:submission/reject
/heichelos/:heichel/submissions/:submission/publish
/profile/meta
/profile/batch
/profile/feed
/profile/templates
/profile/:alias
/profile/:alias/posts
/profile/:alias/comments
/profile/:alias/activity
/profile/:alias/tree
/profile/:alias/series-tree
/profile/:alias/heichelos
/alias/:alias/history
`.trim().split('\n');

module.exports = {
	requiredRoutesCore
};
