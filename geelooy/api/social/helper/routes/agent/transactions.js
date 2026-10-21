//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTransactions
 * @description
 * Agent-as-user write transactions for the Awtsmoos agent API. An API key
 * identifies the user; the agent may do everything that user can do —
 * create/edit/delete posts, create/edit/delete heichelos, batch-import
 * posts, and list what they own — as proper API transactions.
 *
 * Every helper reuses the exact platform functions the web UI uses
 * (socialContent, heichel, post), so agent-created records are byte-for-byte
 * the same shape as user-created ones. Permission model:
 *   1. The alias must belong to the key's user (/users/<userId>/aliases/<aliasId>).
 *   2. Heichel writes need the alias in the heichel's editors list
 *      (creators are added as editors, so owners always pass).
 *   3. Post edits/deletes additionally allow the post's own author alias.
 * Nothing here touches existing behavior; it only reads $i.db.
 * No external libraries; node builtins only.
 */

const { MAX_IMPORT_ITEMS, MAX_LIST_LIMIT, asUser, ownedAlias, heichelAuthority } = require('./transactionsAuth.js');
const { agentCreatePost, agentImportPosts } = require('./transactionsPostCreate.js');
const { agentEditPost, agentDeletePost } = require('./transactionsPostModify.js');
const { agentCreateHeichel, agentEditHeichel, agentDeleteHeichel, agentListHeichelos } = require('./transactionsHeichel.js');
const { agentListPosts } = require('./transactionsList.js');

module.exports = {
	MAX_IMPORT_ITEMS,
	MAX_LIST_LIMIT,
	asUser,
	ownedAlias,
	heichelAuthority,
	agentCreatePost,
	agentImportPosts,
	agentEditPost,
	agentDeletePost,
	agentCreateHeichel,
	agentEditHeichel,
	agentDeleteHeichel,
	agentListHeichelos,
	agentListPosts
};
