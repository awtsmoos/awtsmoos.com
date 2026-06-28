/**
 * B"H
 * @module ContentNormalizer
 * @description Chapter 643: no error vessel becomes a card. Old route maps,
 * new success wrappers, series shells, and AwtsmoosDB record chambers are opened
 * carefully; rupture objects are discarded instead of being displayed as fake
 * ikar content.
 */
export function normalizeCollection(value) {
    const opened = openResponseVessel(value);
    if (isErrorVessel(opened)) return [];
    const list = Array.isArray(opened)
        ? opened
        : opened && typeof opened === 'object' && isCollectionMap(opened)
            ? Object.entries(opened).map(([key, entry]) => withMapKey(entry, key))
            : [];
    return list.map(openRecordVessel).filter(isUsableRecord);
}

export function openResponseVessel(value) {
    if (Array.isArray(value) || !value || typeof value !== 'object') return value;
    if (isErrorVessel(value)) return [];
    const detailOnly = value.subSeries || value.posts || value.postIds || value.subSeriesIds;
    if (detailOnly && !value.success && !value.data && !value.result) {
        if (Array.isArray(value.subSeries)) return value.subSeries;
        if (Array.isArray(value.posts)) return value.posts;
        if (value.posts && typeof value.posts === 'object') return value.posts;
    }
    for (const key of ['success', 'items', 'records', 'data', 'result']) {
        const child = value[key];
        if (Array.isArray(child)) return child;
        if (child && typeof child === 'object' && !isErrorVessel(child) && isCollectionMap(child)) return child;
    }
    return value;
}

export function openRecordVessel(item) {
    if (!item || typeof item !== 'object' || isErrorVessel(item)) return null;
    const opened = [item.prateem, item.record, item.details, item.data, item].find(candidate => candidate && typeof candidate === 'object' && !isErrorVessel(candidate));
    if (!opened) return null;
    return { ...opened, ...identityFields(item) };
}

function identityFields(item) {
    const fields = {};
    ['id', 'postId', 'seriesId', 'inputId', 'indexInSeries', 'parentSeriesId'].forEach(key => {
        if (item[key] !== undefined) fields[key] = item[key];
    });
    return fields;
}
function withMapKey(entry, key) {
    if (!entry || typeof entry !== 'object') return entry;
    if (entry.id || entry.postId || entry.seriesId || entry.inputId) return entry;
    return { ...entry, id: key };
}
function isCollectionMap(value) {
    if (!value || typeof value !== 'object' || isErrorVessel(value)) return false;
    const keys = Object.keys(value);
    if (keys.length === 0) return true;
    const recordKeys = ['id', 'postId', 'seriesId', 'title', 'name', 'description', 'content', 'isRoot'];
    if (recordKeys.some(key => value[key] !== undefined)) return false;
    return Object.values(value).every(entry => entry && typeof entry === 'object' && !isErrorVessel(entry));
}
function isErrorVessel(value) {
    if (!value || typeof value !== 'object') return false;
    return Boolean(value.error || value.code === 'ROUTE_ERROR' || value.code === 'SERIES_NOT_FOUND' || value.code === 'POSTS_GET_FAILED');
}
function isUsableRecord(record) {
    if (!record || typeof record !== 'object' || isErrorVessel(record)) return false;
    return Boolean(record.id || record.postId || record.seriesId || record.inputId || record.title || record.name || record.content || record.description);
}
