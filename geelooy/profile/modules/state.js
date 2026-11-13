// B"H
/**
 * @module ProfileState
 * @description
 * Chapter 20: The Awtsmoos gathers mutable profile facts into one quiet
 * vessel. The UI reads from this state; API modules provide new data; renderers
 * reveal it without hidden globals.
 *
 * @contracts aliases are normalized objects; defaultAlias is a string; failed
 * alias Heichel loads are recorded for visible recovery.
 * @sideEffects Mutates this module-local state object only.
 */

export const state = {
  aliases: [],
  defaultAlias: "",
  heichelosByAlias: new Map(),
  heichelErrors: new Map()
};

export function setDefaultAliasState(aliasId) {
  state.defaultAlias = aliasId || "";
  state.aliases.forEach(alias => {
    alias.default = Boolean(alias.id && alias.id === state.defaultAlias);
  });
}

export function setAliases(aliases, defaultAlias) {
  state.defaultAlias = defaultAlias || "";
  state.aliases = aliases.map(alias => ({
    ...alias,
    default: Boolean(alias.id && alias.id === state.defaultAlias)
  }));
  state.aliases.sort((a, b) => Number(b.default) - Number(a.default));
  saveCachedAliases(state.aliases);
}

// B"H social fix 18 (defect 2): the alias list is saved whenever it
// loads, so a later load whose alias API times out can still boot from
// the last-known aliases (and the cached Posts stat, which is keyed by
// the alias list, can still match). Stored slim: only id/name/default —
// the fields the hero and the posts list need. Refreshed on every
// successful load, so a changed alias set never stays stale.
const ALIASES_CACHE_KEY = 'awtsmoos-profile-aliases-v1';

export function readCachedAliases() {
  try {
    const raw = localStorage.getItem(ALIASES_CACHE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.aliases) || !saved.aliases.length) return null;
    const aliases = saved.aliases
      .filter((a) => a && typeof a.id === 'string' && a.id)
      .map((a) => ({ id: a.id, name: typeof a.name === 'string' && a.name ? a.name : a.id, default: Boolean(a.default) }));
    return aliases.length ? aliases : null;
  } catch { return null; }
}

function saveCachedAliases(aliases) {
  try {
    if (!aliases || !aliases.length) return;
    const slim = aliases
      .map((a) => ({ id: String(a.id || ''), name: typeof a.name === 'string' ? a.name : '', default: Boolean(a.default) }))
      .filter((a) => a.id);
    if (!slim.length) return;
    localStorage.setItem(ALIASES_CACHE_KEY, JSON.stringify({ aliases: slim, at: Date.now() }));
  } catch { /* private mode / quota — boot still works, just uncached */ }
}
