// B"H
/**
 * @module RichCommentSchema
 * @description
 * Chapter 178: Comments are now small posts. A comment may have root content,
 * media, links, and its own sections; replies may answer the whole comment or a
 * specific comment section.
 */

function text(value, max = 2000) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function array(value) { if (Array.isArray(value)) return value; try { return JSON.parse(value || '[]'); } catch { return []; } }

function cleanAsset(asset) {
  if (!asset) return null;
  const item = typeof asset === 'string' ? { id: asset } : asset;
  return { id: text(item.id || item.assetId, 140), type: text(item.type || item.kind || '', 24), mime: text(item.mime || '', 80), publicPath: text(item.publicPath || item.url || '', 500), alt: text(item.alt || item.title || '', 180), role: text(item.role || '', 40) };
}

function cleanLink(link) {
  if (!link) return null;
  const item = typeof link === 'string' ? { url: link } : link;
  return { kind: text(item.kind || (item.commentId ? 'comment' : item.postId ? 'post' : 'url'), 32), url: text(item.url || '', 700), heichelId: text(item.heichelId || '', 100), seriesId: text(item.seriesId || '', 100), postId: text(item.postId || '', 100), commentId: text(item.commentId || '', 140), sectionId: text(item.sectionId || '', 100), label: text(item.label || item.title || '', 180) };
}

function cleanSection(section, index = 0) {
  const item = section && typeof section === 'object' ? section : { content: section };
  const links = array(item.links).map(cleanLink).filter(Boolean).slice(0, 10);
  return { id: text(item.id || item.sectionId || `comment_section_${index + 1}`, 120), title: text(item.title || item.label || `Section ${index + 1}`, 180), content: text(item.content || item.text || item.html || '', 8000), html: text(item.html || item.content || item.text || '', 8000), assets: array(item.assets).map(cleanAsset).filter(Boolean).slice(0, 20), links, previews: links.map(previewForLink), order: Number.isFinite(Number(item.order)) ? Number(item.order) : index };
}

function previewForLink(link) {
  if (link.commentId) return { kind: 'comment', title: link.label || `Comment ${link.commentId}`, href: link.url || `/comment/${link.commentId}${link.sectionId ? `#${link.sectionId}` : ''}` };
  if (link.postId) return { kind: 'post', title: link.label || `Post ${link.postId}`, href: link.url || `/post/${link.postId}` };
  return { kind: 'url', title: link.label || link.url, href: link.url };
}

function normalizeCommentBody(body = {}) {
  const assets = array(body.assets || body.attachments).map(cleanAsset).filter(Boolean).filter(asset => asset.id || asset.publicPath).slice(0, 30);
  const links = array(body.links).map(cleanLink).filter(Boolean).filter(link => link.url || link.postId || link.commentId).slice(0, 16);
  const sections = array(body.sections || body.commentSections).map(cleanSection).filter(section => section.content || section.assets.length || section.links.length).slice(0, 24);
  return { content: text(body.content || body.text || '', 8000), audioNoteText: text(body.audioNoteText || body.transcript || '', 2000), verseSection: text(body.verseSection || body.verseId || 'root', 100), subsectionId: text(body.subsectionId || body.segmentId || '', 100), parentSectionId: text(body.parentSectionId || body.replyToSectionId || '', 120), assets, sections, links, previews: links.map(previewForLink), mood: text(body.mood || '', 40) };
}

function uniqueCommentUrl(comment) { return `/heichelos/${encodeURIComponent(comment.heichelId)}/posts/${encodeURIComponent(comment.postId)}/comments/${encodeURIComponent(comment.id)}`; }

module.exports = { normalizeCommentBody, uniqueCommentUrl, previewForLink, cleanAsset, cleanLink, cleanSection };
