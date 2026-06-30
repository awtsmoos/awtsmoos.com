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
}
