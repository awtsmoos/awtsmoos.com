// B"H
const { timestamp } = require('./tanachPlan.js');
function verseSection(verse) {
  const hebrew = String(verse?.hebrew?.text || '').trim();
  if (!hebrew) throw new Error('Canonical Tanach verse has no Hebrew text');
  return [hebrew];
}
function buildPost(series, postId, item, chapterIndex) {
  const verses = Object.values(item.data.body.verses || {});
  const sections = verses.map(verseSection);
  if (!sections.length) throw new Error(`Canonical Tanach chapter is empty: ${series} ${chapterIndex + 1}`);
  return {
    id: postId,
    title: item.data.titles[3] || `Chapter ${chapterIndex + 1}`,
    content: '',
    author: 'awtsmoos',
    parentSeriesId: series,
    createdAt: timestamp(postId),
    dayuh: {
      sections,
      meta: {
        restoredFrom: 'docs/torah/Tanach.json',
        sourceArticleId: Number(item.data.body['article-id']),
        sourceBookTitle: item.data.titles[2],
        sourceChapter: chapterIndex + 1,
        canonicalHebrew: true
      }
    }
  };
}
function buildBundles(plan) {
  const bundles = new Map();
  for (const [series, items] of plan.grouped) {
    const ids = plan.posts.get(series), bundle = {};
    items.forEach((item, index) => { bundle[ids[index]] = buildPost(series, ids[index], item, index); });
    bundles.set(series, bundle);
  }
  return bundles;
}
module.exports = { buildPost, buildBundles };
