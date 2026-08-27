// B"H
/**
 * @module LivingProfileCard
 * @description Chapter 612: The alias living card now carries universal object
 * card, timeline, relationships, and search links when available.
 */
const { aggregateProfile } = require('./index.js');
const { listFollows, followers } = require('./follows.js');
const { communicationOverview } = require('../communications.js');
const objects = require('../objects/index.js');
function count(items) { return Array.isArray(items) ? items.length : 0; }
function first(items, limit) { return Array.isArray(items) ? items.slice(0, limit) : []; }
function score(profile, communications, follows, followerAliases) {
  const stats = profile?.stats || {};
  return Number(stats.posts || 0) * 3 + Number(stats.comments || 0) + count(follows) * 2 + count(followerAliases) * 4 + Number(communications?.inbox?.unread || 0);
}
function knowledgeLinks(profile) {
  const out = [];
  for (const heichel of first(profile?.heichelos, 8)) out.push({ type: 'heichel', id: heichel.id, title: heichel.name });
  for (const post of first(profile?.posts, 8)) out.push({ type: 'post', id: post.postId || post.id, title: post.title, heichelId: post.heichelId });
  for (const node of first(profile?.tree, 8)) out.push({ type: node.kind || 'tree', id: node.id, title: node.title || node.name });
  return out.filter(item => item.id || item.title).slice(0, 16);
}
function universalAliasObject({ $i, aliasId, profile }) {
  const got = objects.getUniversalObject({ $i, type: 'alias', id: aliasId });
  if (got.success) return objects.inspectUniversalObject({ $i, type: 'alias', id: aliasId }).success;
  return { card: objects.objectType('alias'), object: { type: 'alias', id: aliasId, title: profile?.profile?.displayName || aliasId }, relationships: {}, timeline: [], health: { level: 'unregistered' }, metrics: {} };
}
async function livingProfileCard({ $i, userid, aliasId }) {
  const profile = await aggregateProfile({ $i, aliasId });
  if (!profile) return null;
  const [communications, follows, followerAliases] = await Promise.all([
    communicationOverview({ $i, userid, aliasId }).then(r => r.success || null).catch(() => null),
    listFollows({ $i, aliasId }).catch(() => []),
    followers({ $i, type: 'alias', id: aliasId }).catch(() => [])
  ]);
  const reputationScore = score(profile, communications, follows, followerAliases);
  const universalObject = universalAliasObject({ $i, aliasId, profile });
  return {
    aliasId,
    profile: profile.profile,
    alias: profile.alias,
    presence: communications?.live || null,
    communications: communications ? { inbox: communications.inbox, mail: communications.mail, notifications: communications.notifications } : null,
    recentThoughts: first(profile.posts, 6),
    recentActivity: first(profile.activity, 10),
    memory: { history: first(profile.history, 8), pinned: first(profile.pinned, 3) },
    relationships: { follows: first(follows, 12), followers: first(followerAliases, 12), counts: { follows: count(follows), followers: count(followerAliases) } },
    reputation: { score: reputationScore, level: reputationScore >= 100 ? 'civilization-builder' : reputationScore >= 25 ? 'active-scribe' : 'new-spark' },
    knowledgeLinks: knowledgeLinks(profile),
    universalObject,
    civilizationState: { route: `/api/social/profiles/${encodeURIComponent(aliasId)}/living-card`, generatedAt: Date.now(), canonicalNamespace: '/api/social' }
  };
}
module.exports = { livingProfileCard };
