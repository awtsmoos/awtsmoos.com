// B"H
/** Chapter 609: Existing social objects can wear universal object garments
 * without migrating their source data.
 */
function fromPost(post = {}) {
  const id = post.postId || post.id || post.slug || '';
  return { type: 'post', id, title: post.title || id, summary: post.excerpt || post.description || post.content || '', creator: { type: 'alias', id: post.aliasId || post.author || '' }, metadata: { heichelId: post.heichelId || '', seriesId: post.seriesId || post.parentSeriesId || '' }, tags: ['post', post.contentType || post.postType || 'text'].filter(Boolean), relationships: [{ type: 'heichel', id: post.heichelId || '', label: 'Heichel' }, { type: 'series', id: post.seriesId || post.parentSeriesId || '', label: 'Series' }].filter(r => r.id), createdAt: post.createdAt || post.timestamp || Date.now(), updatedAt: post.updatedAt || post.createdAt || Date.now() };
}
function fromSeries(series = {}) {
  const id = series.seriesId || series.id || series.slug || '';
  return { type: 'series', id, title: series.title || series.name || id, summary: series.description || '', creator: { type: 'alias', id: series.aliasId || series.author || '' }, metadata: { heichelId: series.heichelId || '', parentSeriesId: series.parentSeriesId || '' }, tags: ['series'], relationships: [{ type: 'heichel', id: series.heichelId || '', label: 'Heichel' }, { type: 'series', id: series.parentSeriesId || '', label: 'Parent Series' }].filter(r => r.id), createdAt: series.createdAt || Date.now(), updatedAt: series.updatedAt || series.createdAt || Date.now() };
}
function fromComment(comment = {}) {
  const id = comment.commentId || comment.id || '';
  return { type: 'comment', id, title: String(comment.title || comment.content || id).slice(0, 90), summary: comment.content || '', creator: { type: 'alias', id: comment.aliasId || comment.author || '' }, metadata: { heichelId: comment.heichelId || '', postId: comment.postId || '' }, tags: ['comment'], relationships: [{ type: 'post', id: comment.postId || '', label: 'Post' }].filter(r => r.id), createdAt: comment.createdAt || Date.now(), updatedAt: comment.updatedAt || comment.createdAt || Date.now() };
}
function fromAlias(aliasId, profile = {}) {
  return { type: 'alias', id: aliasId, title: profile.displayName || profile.name || aliasId, summary: profile.bio || profile.description || '', creator: { type: 'alias', id: aliasId }, metadata: { profile }, tags: ['alias', 'profile'], relationships: [], createdAt: Date.now(), updatedAt: Date.now() };
}
module.exports = { fromPost, fromSeries, fromComment, fromAlias };
