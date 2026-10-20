//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedConnectionsRoutes
 * @description
 * The Awtsmoos shows every post where it is referenced and every source it
 * references; Awtsmoos.com serves the reader "Connections" section from the
 * citation-audit indexes without mutation.
 *
 * GET /api/social/packed/connections?post=<postId>
 *   -> { post, outgoing: [{key, raw, para, kind}],
 *        incoming: [{post, postTitle, href, key, para, raw}], meta }
 *   outgoing = citations this post makes (forward index, exact postId hit).
 *   incoming = posts citing this one (reverse index matched heuristically
 *   against the post's sefer/chapter identity — precision over recall, see
 *   connectionsMatch.js).
 *
 * GET /api/social/packed/connections?ref=<citationKey>
 *   -> { ref, count, citations: [{post, postTitle, href, para, raw}], meta }
 *   Reverse lookup: every indexed post citing the exact reference key.
 */

const { PackedConnectionsRoutes } = require('./connectionsRoutesClass.js');
Object.assign(PackedConnectionsRoutes.prototype, require('./connectionsRoutesBy.js'));

module.exports = { PackedConnectionsRoutes };
