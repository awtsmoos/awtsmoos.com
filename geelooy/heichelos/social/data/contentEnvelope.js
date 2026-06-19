// B"H
/**
 * @module SocialContentEnvelope
 * @description
 * Chapter 52: Scattered post shapes receive one garment.
 * The Awtsmoos gathers title, sections, assets, comments, author, heichel,
 * and series into a single envelope so feed, profile, search, and post reader
 * can drink from the same living stream.
 */
export function normalizeContent(raw = {}, defaults = {}) {
    const id = first(raw.contentId, raw.id, raw.postId, raw.aliasId, defaults.contentId, 'unknown');
    const title = first(raw.title, raw.name, raw.subject, defaults.title, 'Untitled revelation');
    const sections = normalizeSections(first(raw.sections, raw.body, raw.content, raw.text, ''));
    const assets = normalizeAssets(first(raw.assets, raw.media, raw.attachments, []));

    return {
        contentId: String(id),
        kind: first(raw.kind, raw.type, defaults.kind, 'post'),
        title: String(title),
        summary: first(raw.summary, raw.description, raw.excerpt, sections[0]?.body, ''),
        authorAlias: first(raw.authorAlias, raw.author, raw.alias, defaults.authorAlias, 'Anonymous alias'),
        heichelId: first(raw.heichelId, raw.heichel, defaults.heichelId, ''),
        seriesId: first(raw.seriesId, raw.series, defaults.seriesId, ''),
        sections,
        assets,
        counts: normalizeCounts(raw.counts || raw),
        visibility: first(raw.visibility, defaults.visibility, 'public'),
        createdAt: first(raw.createdAt, raw.created, raw.timestamp, defaults.createdAt, ''),
        updatedAt: first(raw.updatedAt, raw.modified, defaults.updatedAt, '')
    };
}

export function normalizeSections(source) {
    if (Array.isArray(source)) return source.map(normalizeSection).filter(Boolean);
    if (typeof source === 'string' && source.trim()) return [normalizeSection({ body: source, order: 0 })];
    return [];
}

export function normalizeAssets(source) {
    if (!Array.isArray(source)) return [];
    return source.map(normalizeAsset).filter(Boolean);
}

function normalizeSection(section, index = 0) {
    if (typeof section === 'string') section = { body: section };
    if (!section || typeof section !== 'object') return null;
    const order = Number.isFinite(section.order) ? section.order : index;
    return {
        sectionId: String(first(section.sectionId, section.id, `section-${order}`)),
        title: first(section.title, ''),
        body: String(first(section.body, section.content, section.text, '')),
        order
    };
}

function normalizeAsset(asset, index = 0) {
    if (typeof asset === 'string') asset = { kind: asset, label: asset };
    if (!asset || typeof asset !== 'object') return null;
    const kind = inferKind(asset);
    return {
        assetId: String(first(asset.assetId, asset.id, `asset-${index}`)),
        kind,
        label: first(asset.label, asset.name, asset.title, kind),
        url: first(asset.url, asset.src, asset.href, ''),
        sectionId: first(asset.sectionId, '')
    };
}

function normalizeCounts(source) {
    return {
        comments: Number(first(source.comments, source.commentCount, 0)) || 0,
        replies: Number(first(source.replies, source.replyCount, 0)) || 0,
        reactions: Number(first(source.reactions, source.reactionCount, 0)) || 0,
        assets: Number(first(source.assets, source.assetCount, 0)) || 0
    };
}

function inferKind(asset) {
    const explicit = first(asset.kind, asset.type, '');
    const mime = String(first(asset.mime, asset.mimeType, '')).toLowerCase();
    if (explicit) return String(explicit).toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('video/')) return 'video';
    return 'file';
}

function first(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}
