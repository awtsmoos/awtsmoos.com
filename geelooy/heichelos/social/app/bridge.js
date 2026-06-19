// B"H
/**
 * @module SocialRevampBridge
 * @description
 * Chapter 48: The bridge refuses to conquer the old palace by accident.
 * The Awtsmoos opens the new social shell only when a clear sign is given:
 * query, hash, or dataset. Thus the legacy Heichelos flow remains untouched
 * while the revamp can be summoned, tested, and revealed step by step.
 */
import { bootSocialRevamp } from './boot.js';

const QUERY_FLAG = 'socialRevamp';
const HASH_FLAG = 'social-revamp';
const DATA_FLAG = 'socialRevamp';

export function shouldMountSocialRevamp(locationLike = globalThis.location, documentLike = globalThis.document) {
    return hasQueryFlag(locationLike) || hasHashFlag(locationLike) || hasDatasetFlag(documentLike);
}

export function mountSocialRevampWhenRequested(options = {}) {
    const locationLike = options.location || globalThis.location;
    const documentLike = options.document || globalThis.document;

    if (!shouldMountSocialRevamp(locationLike, documentLike)) {
        return { mounted: false, reason: 'not-requested' };
    }

    const target = getTarget(options, documentLike);
    if (!target) return { mounted: false, reason: 'missing-target' };

    const boot = options.boot || bootSocialRevamp;
    const root = boot(target, options.data || {});
    return { mounted: true, root, target };
}

function hasQueryFlag(locationLike) {
    const search = locationLike?.search || '';
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    return params.get(QUERY_FLAG) === '1' || params.get(QUERY_FLAG) === 'true';
}

function hasHashFlag(locationLike) {
    return String(locationLike?.hash || '').toLowerCase().includes(HASH_FLAG);
}

function hasDatasetFlag(documentLike) {
    return documentLike?.documentElement?.dataset?.[DATA_FLAG] === '1' ||
        documentLike?.documentElement?.dataset?.[DATA_FLAG] === 'true';
}

function getTarget(options, documentLike) {
    if (options.target) return options.target;
    if (!documentLike) return null;
    return documentLike.querySelector?.('[data-social-revamp-root]') || documentLike.body || null;
}
