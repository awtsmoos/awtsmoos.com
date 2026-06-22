// B"H
/**
 * @module ProfileFollows
 * @description
 * Chapter 427: Following is a covenant path between aliases and entities.
 */

const { cleanText } = require("./sanitize.js");

function followKey(aliasId) { return `/social/aliases/${aliasId}/following`; }
function followerKey(type, id) { return `/social/followers/${type}/${id}`; }
function normalize(input = {}) {
    const type = cleanText(input.type || input.targetType || "alias", 40) || "alias";
    const id = cleanText(input.id || input.targetId || input.aliasId || "", 160);
    return { type, id, followedAt: Number(input.followedAt || Date.now()) || Date.now(), notifications: input.notifications !== "off" };
}
async function listFollows({ $i, aliasId }) {
    const stored = await $i.db.get(followKey(aliasId)).catch(() => []);
    return Array.isArray(stored) ? stored : [];
}
async function follow({ $i, aliasId, input }) {
    const item = normalize(input);
    if (!item.id) return { error: { code: "BAD_TARGET", message: "Missing follow target." } };
    const current = await listFollows({ $i, aliasId });
    const next = [item, ...current.filter(x => !(x.type === item.type && x.id === item.id))].slice(0, 1000);
    await $i.db.write(followKey(aliasId), next);
    const followers = await $i.db.get(followerKey(item.type, item.id)).catch(() => []);
    const followerList = Array.isArray(followers) ? followers : [];
    await $i.db.write(followerKey(item.type, item.id), [aliasId, ...followerList.filter(x => x !== aliasId)].slice(0, 5000));
    return { success: item, count: next.length };
}
async function unfollow({ $i, aliasId, input }) {
    const item = normalize(input);
    const current = await listFollows({ $i, aliasId });
    const next = current.filter(x => !(x.type === item.type && x.id === item.id));
    await $i.db.write(followKey(aliasId), next);
    const followers = await $i.db.get(followerKey(item.type, item.id)).catch(() => []);
    const followerList = Array.isArray(followers) ? followers : [];
    await $i.db.write(followerKey(item.type, item.id), followerList.filter(x => x !== aliasId));
    return { success: true, count: next.length };
}
async function followers({ $i, type, id }) {
    const stored = await $i.db.get(followerKey(type, id)).catch(() => []);
    return Array.isArray(stored) ? stored : [];
}
module.exports = { listFollows, follow, unfollow, followers };
