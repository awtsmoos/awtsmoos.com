// B"H
const { overlap } = require('./text.js');
async function resolvePost($i, heichelId, seriesId, postId) {
  try {
    const path = `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
    let post = null;
    try { post = await $i.db.getValue(path, postId, { id: true, title: true, content: true, dayuh: true, sections: true }); } catch { post = null; }
    // B"H 2026-11-19: getValue returns null/error (or throws) for some post
    // shapes (Midrashim units docs) while Bavli docs pass. Fall back exactly
    // the way getPostFromSeries does: $i.db.get on the post path.
    if (!post || post.error) {
      try { post = await $i.db.getValue(path, postId); } catch { post = null; }
    }
    if (!post || post.error) {
      try {
        const pm = { title: true, dayuh: true, content: true, author: true, id: true };
        const all = await $i.db.get(path + '/' + postId, { [postId]: pm });
        if (all && all[postId]) post = all[postId];
      } catch { post = null; }
    }
    if (!post || post.error) return null;
    return post;
  } catch { return null; }
}
function sectionsOf(post) {
  const choices = [post?.dayuh?.sections, post?.sections, post?.content?.sections];
  return choices.find(Array.isArray) || [];
}
function sourceHebrew(row) {
  return row?.sourceHebrew || row?.dayuh?.sourceHebrew || row?.dayuh?.hebrewPreview ||
    row?.comment?.dayuh?.hebrewPreview || '';
}
function alignment(row, post) {
  const sections = sectionsOf(post);
  const raw = row?.verseSection ?? row?.dayuh?.verseSection;
  const index = Number(raw);
  if (!Number.isInteger(index)) return { status: 'unresolved', coordinate: raw };
  if (!sections.length) return { status: 'unverified', coordinate: index };
  if (index < 0 || index >= sections.length) return { status: 'out-of-bounds', coordinate: index, sectionCount: sections.length };
  const section = Array.isArray(sections[index]) ? sections[index].join(' ') : sections[index];
  const score = overlap(sourceHebrew(row), section);
  const status = score === null ? 'low-information' : score >= .8 ? 'exact' : score >= .5 ? 'strong' : 'weak';
  return { status, coordinate: index, confidence: score, sectionCount: sections.length };
}
module.exports = { resolvePost, sectionsOf, alignment };
