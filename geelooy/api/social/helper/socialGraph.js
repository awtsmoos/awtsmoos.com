//B"H
/**
 * @module socialGraph
 * @description
 * Chapter 159: Every entity is a directory-vessel, not both file and chamber.
 * `data` holds the entity record; `outbound` and `inbound` hold references.
 * This prevents DosDB EISDIR clashes when questions and answers link intensely.
 */

const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');
const { mirrorGraphReference } = require('./packed/socialPacked.js');

const ALLOWED_ENTITY_TYPES = ['post', 'question', 'answer', 'comment', 'section', 'series', 'heichel', 'alias', 'repost', 'citation', 'collection'];
const REFERENCE_KINDS = ['references', 'reposts', 'quotes', 'answers', 'crossLinks'];

function cleanText(value, fallback = '') { return String(value || fallback).trim(); }

function normalizeEntity(input = {}) {
    const type = cleanText(input.type || input.entityType);
    const id = cleanText(input.id || input.entityId);
    if (!ALLOWED_ENTITY_TYPES.includes(type)) return { error: er({ code: 'BAD_ENTITY_TYPE', message: `Unsupported entity type: ${type}` }) };
    if (!id) return { error: er({ code: 'MISSING_ENTITY_ID', message: 'Missing entity id.' }) };
    return { type, id, heichelId: cleanText(input.heichelId), seriesId: cleanText(input.seriesId), parentId: cleanText(input.parentId), sectionId: cleanText(input.sectionId), aliasId: cleanText(input.aliasId) };
}

function entityKey(entity) {
    return [entity.type, entity.heichelId, entity.seriesId, entity.parentId, entity.id, entity.sectionId].filter(Boolean).map(encodeURIComponent).join('__');
}

function graphRoot() { return `${sp}/graph`; }
function entityFolder(entity) { return `${graphRoot()}/entities/${entityKey(entity)}`; }
function entityDataPath(entity) { return `${entityFolder(entity)}/data`; }
function outboundPath(entity, kind) { return `${entityFolder(entity)}/outbound/${kind}`; }
function inboundPath(entity, kind) { return `${entityFolder(entity)}/inbound/${kind}`; }
function referenceId({ from, to, kind }) { return `${kind}_${entityKey(from)}__TO__${entityKey(to)}`; }

async function resolveEntity({ $i, entity }) {
    const normalized = normalizeEntity(entity);
    if (normalized.error) return normalized.error;
    const stored = await $i.db.get(entityDataPath(normalized)).catch(() => null);
    return { success: { entity: normalized, graph: stored || null, canonicalPath: entityDataPath(normalized) } };
}

async function writeEntityData($i, entity, createdAt) {
    await $i.db.write(entityDataPath(entity), { entity, updatedAt: createdAt });
}

async function addGraphReference({ $i, from, to, kind = 'references', aliasId, excerpt = '', note = '' }) {
    if (!REFERENCE_KINDS.includes(kind)) return er({ code: 'BAD_REFERENCE_KIND', message: `Unsupported reference kind: ${kind}` });
    const source = normalizeEntity(from);
    if (source.error) return source.error;
    const target = normalizeEntity(to);
    if (target.error) return target.error;
    const id = referenceId({ from: source, to: target, kind });
    const record = { id, kind, from: source, to: target, aliasId: cleanText(aliasId || source.aliasId), excerpt: cleanText(excerpt).slice(0, 1200), note: cleanText(note).slice(0, 1200), createdAt: Date.now() };
    await $i.db.write(`${outboundPath(source, kind)}/${id}`, record);
    await $i.db.write(`${inboundPath(target, kind)}/${id}`, record);
    await writeEntityData($i, source, record.createdAt);
    await writeEntityData($i, target, record.createdAt);
    mirrorGraphReference({ $i, reference: record });
    return { success: record };
}

async function listGraphReferences({ $i, entity, direction = 'outbound', kind = 'references' }) {
    if (!REFERENCE_KINDS.includes(kind)) return er({ code: 'BAD_REFERENCE_KIND', message: `Unsupported reference kind: ${kind}` });
    const normalized = normalizeEntity(entity);
    if (normalized.error) return normalized.error;
    const base = direction === 'inbound' ? inboundPath(normalized, kind) : outboundPath(normalized, kind);
    const records = await $i.db.get(base).catch(() => null);
    if (Array.isArray(records)) {
        const hydrated = [];
        for (const id of records) hydrated.push(await $i.db.get(`${base}/${id}`).catch(() => id));
        return { success: hydrated };
    }
    return { success: records && typeof records === 'object' ? Object.values(records) : [] };
}

function field(body, key) {
    if (!body || typeof body !== 'object') return undefined;
    if (body[key] !== undefined) return body[key];
    const lower = key.toLowerCase();
    const found = Object.keys(body).find(item => item.toLowerCase() === lower);
    return found ? body[found] : undefined;
}

function entityFromPost(body = {}, prefix = 'entity') {
    const raw = field(body, prefix);
    if (raw && typeof raw === 'object') return normalizeEntity(raw);
    if (raw && typeof raw === 'string') { try { return normalizeEntity(JSON.parse(raw)); } catch {} }
    return normalizeEntity({ type: field(body, `${prefix}Type`), id: field(body, `${prefix}Id`), heichelId: field(body, `${prefix}HeichelId`), seriesId: field(body, `${prefix}SeriesId`), parentId: field(body, `${prefix}ParentId`), sectionId: field(body, `${prefix}SectionId`), aliasId: field(body, `${prefix}AliasId`) });
}

module.exports = { ALLOWED_ENTITY_TYPES, REFERENCE_KINDS, normalizeEntity, entityKey, resolveEntity, addGraphReference, listGraphReferences, entityFromPost };
