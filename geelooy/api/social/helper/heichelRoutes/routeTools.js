// B"H
/**
 * @module HeichelRouteTools
 * @description Chapter 521: route helpers carry palace state without bloating the gate.
 */
const { memoizedRead } = require("../profile/readCache.js");
function makeHeichelRouteTools(deps) {
  const { getHeichel, getHeichelos, createHeichel, deleteHeichel, verifyHeichelAuthority, er, requireArray, awtsmoosError } = deps;
  function normalizeHeichelIds(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value && typeof value === 'object') return Object.keys(value).filter(Boolean);
    return [];
  }
  function requestedHeichelId($i) {
    return $i.$_POST?.heichelId || $i.$_POST?.inputId || $i.$_POST?.id;
  }
  async function heichelExists({ $i, heichelId }) {
    if (!heichelId) return false;
    const existing = await getHeichel({ heichelId, $i, er });
    return Boolean(existing && !existing.error && !existing.code && (existing.name || existing.author || existing.description || existing.id));
  }
  async function computeDetailedHeichelList({ $i, aliasId }) {
    const heichelos = normalizeHeichelIds(await getHeichelos({ $i, aliasId }));
    const results = [];
    for (const id of heichelos) {
      const details = await getHeichel({ heichelId: id, $i, er });
      if (!details || details.error) continue;
      details.id = id;
      if (details.author == aliasId) results.push(details);
    }
    return results;
  }
  // B"H 2026-11-20 round 2: memoized per alias behind the profile read
  // cache (45s + in-flight coalescing — see ../profile/readCache.js).
  // This walk (one getHeichelos + one getHeichel per owned space) was
  // paid in full by EVERY caller: the dashboard's Heichelos tab asks
  // once per alias the account owns (46 requests for a large account),
  // and a single cold call measured 43s on the loaded box. Repeat and
  // concurrent callers now share one walk per TTL window. Callers must
  // treat the returned list as read-only, like every memoized profile
  // section since the round-1 data-layer fix.
  async function detailedHeichelList({ $i, aliasId }) {
    return memoizedRead("heichelDetails:" + aliasId, () => computeDetailedHeichelList({ $i, aliasId }));
  }
  async function heichelDetailsByIds({ $i, heichelIds }) {
    const checked = requireArray(heichelIds, 'heichelIds');
    if (!checked.ok) return checked.error;
    const results = [];
    for (const id of checked.value) {
      const details = await getHeichel({ heichelId: id, $i, er });
      if (!details || details.error) continue;
      details.id = id;
      results.push(details);
    }
    return results;
  }
  async function createHeichelForAlias({ $i, aliasId }) {
    try {
      const heichelId = requestedHeichelId($i);
      if (heichelId && await heichelExists({ $i, heichelId })) return er({ code: 'HEICHEL_EXISTS', message: 'A Heichel with this id already exists.', heichelId });
      return await createHeichel({ $i, er, aliasId });
    } catch (e) { return er({ code: 'CREATE_PROBLEM', details: e + '' }); }
  }
  async function deleteHeichelForAlias({ $i, aliasId, heichelId }) {
    if (!aliasId) return awtsmoosError({ code: 'NO_ALIAS', message: 'aliasId is required to delete a Heichel.' });
    const owns = await verifyHeichelAuthority({ heichelId, aliasId, $i });
    if (!owns) return awtsmoosError({ code: 'NO_HEICHEL_AUTHORITY', message: 'This alias cannot delete this Heichel.', details: { aliasId, heichelId } });
    // Whole-heichel deletion is categorically more destructive than the
    // edits heichel authority normally grants: it removes every series,
    // post, and comment and every membership in the heichel. When the
    // heichel record names its creator, only that creator may delete it;
    // other editors keep their ordinary editing powers but not this one.
    // Records without a named creator fall back to the authority check
    // above, preserving the historical behavior for legacy heichelos.
    try {
      const heichel = await getHeichel({ heichelId, $i, er });
      if (heichel && !heichel.error && heichel.author && heichel.author !== aliasId) {
        return awtsmoosError({
          code: 'HEICHEL_DELETE_CREATOR_ONLY',
          message: 'Only the alias that created this Heichel can delete it. Editors can edit its contents but cannot delete the whole Heichel.',
          details: { aliasId, heichelId }
        });
      }
    } catch (e) { /* an unreadable record falls back to the authority check */ }
    return await deleteHeichel({ $i, heichelId, aliasId, er });
  }
  return { detailedHeichelList, heichelDetailsByIds, createHeichelForAlias, deleteHeichelForAlias };
}
module.exports = { makeHeichelRouteTools };
