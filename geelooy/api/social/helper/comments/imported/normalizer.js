// B"H
const crypto = require('crypto');
const { text } = require('./text.js');
function rowContent(row) {
  return row?.content || row?.comment?.content || row?.dayuh?.sections || row?.comment?.dayuh?.sections || row;
}
function stableId(source, aliasId, seriesId, postId, index, row) {
  const seed = JSON.stringify([source, aliasId, seriesId, postId, index, row?.verseSection, rowContent(row)]);
  return `imported_${source}_${crypto.createHash('sha1').update(seed).digest('hex').slice(0, 22)}`;
}
function normalize({ row, source, aliasId, seriesId, postId, heichelId, index, sourcePath, sourceFile, alignment }) {
  const verseSection = String(row?.verseSection ?? row?.dayuh?.verseSection ?? 'root');
  const content = rowContent(row);
  return {
    id: stableId(source, aliasId, seriesId, postId, index, row),
    heichelId, postId, entityId: postId, seriesId,
    parentId: '', parentSectionId: '', parentType: 'entity',
    aliasId, author: aliasId, content: text(content),
    verseSection, subsectionId: String(row?.subsectionId || ''),
    sections: [], assets: [], links: [], previews: [], replies: [],
    imported: true, readOnly: true, source, sourcePath, sourceFile,
    sourceContent: content,
    sourceHebrew: row?.sourceHebrew || row?.dayuh?.sourceHebrew || row?.dayuh?.hebrewPreview || row?.comment?.dayuh?.hebrewPreview || '',
    dayuh: row?.dayuh || row?.comment?.dayuh || {}, alignment,
    createdAt: row?.createdAt || row?.comment?.createdAt || 0,
    updatedAt: row?.updatedAt || row?.comment?.updatedAt || 0,
    deleted: false
  };
}
function flatten(payload) {
  if (Array.isArray(payload)) return payload;
  const out = [];
  for (const [section, rows] of Object.entries(payload || {})) {
    if (section === '$awtsmoosObjectShape' || !Array.isArray(rows)) continue;
    for (const row of rows) out.push(row?.verseSection === undefined ? { ...row, verseSection: section } : row);
  }
  return out;
}
module.exports = { normalize, flatten, rowContent };
