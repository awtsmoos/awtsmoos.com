// B"H
/**
 * @module ComposerDraft
 * @description
 * Chapter 58: Before a post is born, its sections gather in silence.
 * The Awtsmoos gives the composer an immutable draft vessel where every
 * section can carry text, images, audio, and files before publication.
 */
export function createDraft(seed = {}) {
    const sections = Array.isArray(seed.sections) && seed.sections.length
        ? seed.sections.map(normalizeSection)
        : [normalizeSection({ sectionId: 'section-0', title: '', body: '' })];

    return {
        kind: seed.kind || 'post',
        title: seed.title || '',
        heichelId: seed.heichelId || '',
        seriesId: seed.seriesId || '',
        visibility: seed.visibility || 'public',
        sections,
        assets: normalizeAssets(seed.assets || [])
    };
}

export function addSection(draft, input = {}) {
    const next = cloneDraft(draft);
    const order = next.sections.length;
    next.sections.push(normalizeSection({ sectionId: `section-${order}`, order, ...input }));
    return next;
}

export function updateSection(draft, sectionId, changes = {}) {
    const next = cloneDraft(draft);
    next.sections = next.sections.map(section => {
        if (section.sectionId !== sectionId) return section;
        return normalizeSection({ ...section, ...changes });
    });
    return next;
}

export function addAssetToSection(draft, sectionId, asset = {}) {
    const next = cloneDraft(draft);
    const order = next.assets.length;
    next.assets.push(normalizeAsset({ sectionId, assetId: `asset-${order}`, ...asset }));
    return next;
}

export function toPostPayload(draft) {
    const normalized = createDraft(draft);
    return {
        kind: normalized.kind,
        title: normalized.title.trim(),
        heichelId: normalized.heichelId,
        seriesId: normalized.seriesId,
        visibility: normalized.visibility,
        sections: normalized.sections.filter(section => section.title || section.body),
        assets: normalized.assets
    };
}

function cloneDraft(draft) {
    return createDraft({
        ...draft,
        sections: [...(draft.sections || [])],
        assets: [...(draft.assets || [])]
    });
}

function normalizeSection(section = {}) {
    return {
        sectionId: String(section.sectionId || section.id || 'section-0'),
        title: section.title || '',
        body: section.body || section.content || section.text || '',
        order: Number.isFinite(section.order) ? section.order : 0
    };
}

function normalizeAssets(assets) {
    return assets.map(normalizeAsset).filter(Boolean);
}

function normalizeAsset(asset = {}) {
    if (!asset) return null;
    const kind = inferKind(asset);
    return {
        assetId: String(asset.assetId || asset.id || 'asset-0'),
        sectionId: String(asset.sectionId || ''),
        kind,
        label: asset.label || asset.name || asset.title || kind,
        url: asset.url || asset.src || '',
        mime: asset.mime || asset.mimeType || ''
    };
}

function inferKind(asset) {
    if (asset.kind || asset.type) return String(asset.kind || asset.type).toLowerCase();
    const mime = String(asset.mime || asset.mimeType || '').toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('video/')) return 'video';
    return 'file';
}
