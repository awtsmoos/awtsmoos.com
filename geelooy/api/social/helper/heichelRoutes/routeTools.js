// B"H
/**
 * @module HeichelRouteTools
 * @description Chapter 521: route helpers carry palace state without bloating the gate.
 */
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
  async function detailedHeichelList({ $i, aliasId }) {
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
