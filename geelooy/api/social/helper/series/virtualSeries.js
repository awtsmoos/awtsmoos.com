// B"H
/**
 * @file virtualSeries.js
 * @description
 * Chapter 906: A second map appears beside the first, not instead of it.
 *
 * A canonical series owns its real children. Alternate groups are read-only
 * views that point toward canonical children and can aggregate their posts.
 */
const { sp } = require("../_awtsmoos.constants.js");
const base = (h, s) => `${sp}/heichelos/${h}/series/${s}`;
const prateemPath = (h, s) => `${base(h, s)}/prateem`;
const subSeriesPath = (h, s) => `${base(h, s)}/subSeries`;
const postsPath = (h, s) => `${base(h, s)}/posts`;
const alternateGroupsPath = (h, s) => `${base(h, s)}/alternateGroups`;

async function getSafe($i, path, opts = { max: true }) {
  try { return await $i.db.get(path, opts); } catch { return null; }
}
async function keysSafe($i, path) {
  try { const keys = await $i.db.getObjectKeys(path); return Array.isArray(keys) ? keys : []; } catch { return []; }
}
async function readPrateem($i, heichelId, seriesId) { return getSafe($i, prateemPath(heichelId, seriesId)); }
function isVirtualPrateem(p) { return !!(p?.virtualSeries || p?.isVirtualSeries || p?.referenceMode === "subSeriesPosts"); }
async function isVirtualSeries({ $i, heichelId, seriesId }) { const p = await readPrateem($i, heichelId, seriesId); return isVirtualPrateem(p) ? p : null; }
async function referencedSeriesIds($i, heichelId, seriesId, prateem) {
  if (Array.isArray(prateem?.referencedSeriesIds)) return prateem.referencedSeriesIds;
  if (Array.isArray(prateem?.virtualSeries?.referencedSeriesIds)) return prateem.virtualSeries.referencedSeriesIds;
  const children = await getSafe($i, subSeriesPath(heichelId, seriesId));
  return Array.isArray(children) ? children : [];
}
function decorate(postId, post, actualSeriesId, virtualSeriesId) {
  return { id: post.id || postId, ...post, actualSeriesId, sourceSeriesId: actualSeriesId, virtualSeriesId, parentSeriesId: post.parentSeriesId || actualSeriesId };
}
async function readCanonicalPosts({ $i, heichelId, seriesId, withDetails, properties }) {
  const path = postsPath(heichelId, seriesId);
  const ids = await keysSafe($i, path);
  if (!withDetails) return ids.map(postId => ({ postId, actualSeriesId: seriesId }));
  const opts = { max: true };
  if (properties) opts.propertyMap = Object.fromEntries(ids.map(postId => [postId, properties]));
  const posts = await getSafe($i, path, opts);
  if (!posts || typeof posts !== "object" || Buffer.isBuffer(posts)) return [];
  return ids.map(postId => posts[postId] && decorate(postId, posts[postId], seriesId, null)).filter(Boolean);
}
async function getVirtualPostsInSeries({ $i, heichelId, seriesId, withDetails = false, properties }) {
  const prateem = await isVirtualSeries({ $i, heichelId, seriesId });
  if (!prateem) return null;
  const refs = await referencedSeriesIds($i, heichelId, seriesId, prateem);
  const out = [];
  for (const actualSeriesId of refs) {
    const posts = await readCanonicalPosts({ $i, heichelId, seriesId: actualSeriesId, withDetails, properties });
    for (const post of posts) out.push(withDetails ? { ...post, virtualSeriesId: seriesId } : post.postId || post.id);
  }
  return out;
}
async function getVirtualPostFromSeries({ $i, heichelId, seriesId, postId, properties }) {
  const prateem = await isVirtualSeries({ $i, heichelId, seriesId });
  if (!prateem) return null;
  const refs = await referencedSeriesIds($i, heichelId, seriesId, prateem);
  for (const actualSeriesId of refs) {
    const post = await $i.db.getValue(postsPath(heichelId, actualSeriesId), postId, properties).catch(() => null);
    if (post) return decorate(postId, post, actualSeriesId, seriesId);
  }
  return null;
}
async function getAlternateGroups({ $i, heichelId, seriesId, withDetails = false }) {
  const ids = await getSafe($i, alternateGroupsPath(heichelId, seriesId));
  if (!Array.isArray(ids)) return [];
  if (!withDetails) return ids;
  const out = [];
  for (const id of ids) {
    const prateem = await readPrateem($i, heichelId, id);
    if (prateem) out.push(prateem);
  }
  return out;
}
module.exports = { isVirtualSeries, getVirtualPostsInSeries, getVirtualPostFromSeries, getAlternateGroups };
