// B"H
/**
 * @module ComposerDraft
 * @description Chapter 181: home posting defaults to the profile Heichel, yet
 * the gates to every other Heichel stand near. Verses, subsections, images, and
 * comment coordinates hide as drums beneath a simple first breath.
 */
export function createDraft(seed = {}) {
  const profileHeichelId = seed.profileHeichelId || seed.defaultHeichelId || seed.aliasId || '';
  const targets = normalizeTargets(seed.targets || seed.heichelTargets || [], profileHeichelId);
  const verses = Array.isArray(seed.verses || seed.sections) && (seed.verses || seed.sections).length
    ? (seed.verses || seed.sections).map(normalizeVerse)
    : [normalizeVerse({ id: 'verse-0', verseSection: 'root', title: '', body: '' })];
  return { kind: seed.kind || 'post', title: seed.title || '', aliasId: seed.aliasId || '', heichelId: seed.heichelId || profileHeichelId, profileHeichelId, seriesId: seed.seriesId || 'root', visibility: seed.visibility || 'public', targets, verses, sections: verses, assets: normalizeAssets(seed.assets || seed.rootAssets || []) };
}
export function addSection(draft, input = {}) { return addVerse(draft, input); }
export function addVerse(draft, input = {}) {
  const next = cloneDraft(draft); const order = next.verses.length;
  next.verses.push(normalizeVerse({ id: `verse-${order}`, verseSection: `v${order + 1}`, order, ...input }));
  next.sections = next.verses; return next;
}
export function updateSection(draft, sectionId, changes = {}) { return updateVerse(draft, sectionId, changes); }
export function updateVerse(draft, verseId, changes = {}) {
  const next = cloneDraft(draft);
  next.verses = next.verses.map((v, index) => matchesVerse(v, verseId, index) ? normalizeVerse({ ...v, ...changes }, index) : v);
  next.sections = next.verses; return next;
}
export function addAssetToSection(draft, sectionId, asset = {}) { return addAssetToVerse(draft, sectionId, asset); }
export function addAssetToVerse(draft, verseSection, asset = {}) {
  const next = cloneDraft(draft); const order = next.assets.length;
  const sectionId = resolveVerseSection(next, verseSection);
  next.assets.push(normalizeAsset({ verseSection: sectionId, sectionId, assetId: `asset-${order}`, ...asset }));
  return next;
}
export function addTargetHeichel(draft, heichel = {}) {
  const next = cloneDraft(draft); next.targets = normalizeTargets([...next.targets, heichel], next.profileHeichelId); return next;
}
export function toPostPayload(draft) {
  const d = createDraft(draft);
  const sections = d.verses.filter(v => v.title || v.body || v.assets.length || v.subsections.length).map(v => {
    const verseAssets = [...v.assets, ...d.assets.filter(a => a.verseSection === v.verseSection || a.sectionId === v.verseSection)];
    return { id: v.id, verseSection: v.verseSection, title: v.title, content: v.body, assets: verseAssets, segments: v.subsections };
  });
  sections.toString = () => JSON.stringify(sections.map(({ toString, ...section }) => section));
  return { aliasId: d.aliasId, kind: d.kind, title: d.title.trim(), heichelId: d.heichelId, targetHeichelIds: d.targets.map(t => t.heichelId), seriesId: d.seriesId, visibility: d.visibility, sections, assets: d.assets, rootAssets: JSON.stringify(d.assets.filter(a => !a.verseSection)) };
}
function cloneDraft(draft) { return createDraft({ ...draft, verses: [...(draft.verses || draft.sections || [])], assets: [...(draft.assets || [])], targets: [...(draft.targets || [])] }); }
function normalizeTargets(targets, profileHeichelId) {
  const all = [...targets]; if (profileHeichelId && !all.some(t => (t.heichelId || t.id) === profileHeichelId)) all.unshift({ heichelId: profileHeichelId, label: 'My profile Heichel', primary: true });
  const seen = new Set(); return all.map(t => ({ heichelId: String(t.heichelId || t.id || ''), label: t.label || t.name || t.heichelId || t.id || '', primary: Boolean(t.primary) })).filter(t => t.heichelId && !seen.has(t.heichelId) && seen.add(t.heichelId));
}
function normalizeVerse(v = {}, index = 0) {
  const fallback = `section-${index}`;
  const id = String(v.id || v.sectionId || v.verseSection || fallback); const verseSection = String(v.verseSection || v.sectionId || id);
  const assets = normalizeAssets(v.assets || []).map(a => ({ ...a, verseSection, sectionId: verseSection }));
  const subsections = (Array.isArray(v.subsections || v.segments) ? (v.subsections || v.segments) : []).map((s, i) => normalizeSubsection(s, verseSection, i));
  return { id, verseSection, title: v.title || v.label || '', body: v.body || v.content || v.text || '', order: Number.isFinite(Number(v.order)) ? Number(v.order) : 0, assets, subsections };
}
function normalizeSubsection(s = {}, verseSection, index) { return { id: String(s.id || s.subsectionId || `sub-${index}`), title: s.title || s.label || '', content: s.content || s.body || s.text || '', order: index, assets: normalizeAssets(s.assets || []).map(a => ({ ...a, verseSection, subsectionId: s.id || s.subsectionId || `sub-${index}` })) }; }
function normalizeAssets(assets) { return (Array.isArray(assets) ? assets : []).map(normalizeAsset).filter(Boolean); }
function normalizeAsset(asset = {}) { if (!asset) return null; const kind = inferKind(asset); return { assetId: String(asset.assetId || asset.id || 'asset-0'), sectionId: String(asset.sectionId || asset.verseSection || ''), verseSection: String(asset.verseSection || asset.sectionId || ''), subsectionId: String(asset.subsectionId || ''), kind, label: asset.label || asset.name || asset.title || kind, url: asset.url || asset.src || asset.publicPath || '', publicPath: asset.publicPath || asset.url || asset.src || '', mime: asset.mime || asset.mimeType || '' }; }
function inferKind(asset) { if (asset.kind || asset.type) return String(asset.kind || asset.type).toLowerCase(); const mime = String(asset.mime || asset.mimeType || '').toLowerCase(); if (mime.startsWith('image/')) return 'image'; if (mime.startsWith('audio/')) return 'audio'; if (mime.startsWith('video/')) return 'video'; return 'file'; }
function matchesVerse(verse, verseId, index) { return verse.id === verseId || verse.verseSection === verseId || verseId === `section-${index}` || verseId === `verse-${index}`; }
function resolveVerseSection(draft, verseId) {
  const found = (draft.verses || []).find((verse, index) => matchesVerse(verse, verseId, index));
  return found?.verseSection || verseId;
}
