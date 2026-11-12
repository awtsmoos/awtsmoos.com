// B"H
/**
 * @module ProfileHeichelos
 * @description
 * Chapter 24: The Awtsmoos refuses silent Heichel failure. Each alias load is
 * captured as data, empty state, or visible error card.
 */
import { announceProfile, one, replaceWith, setStat } from "./dom.js";
import { emptyCard, heichelCard } from "./cards.js";
import { getHeichelosForAlias } from "./api.js";
import { state } from "./state.js";

async function loadHeichelosForAlias(alias) {
  try {
    const list = await getHeichelosForAlias(alias.id);
    state.heichelosByAlias.set(alias.id, list);
    state.heichelErrors.delete(alias.id);
    return list.map(heichel => ({ heichel, aliasId: alias.id }));
  } catch (error) {
    state.heichelosByAlias.set(alias.id, []);
    state.heichelErrors.set(alias.id, error.message || "Could not load Heichelos.");
    return [];
  }
}

export async function renderHeichelos() {
  const list = one(".heichel-list");
  if (!list) return;
  replaceWith(list, emptyCard("Loading your Heichelos…", "loading"));
  // B"H social fix 1: batched. The old code fired one heichelos/details request
  // per alias at once (~40) with a 9s per-request timeout; under the profile's
  // ~160-call load they queued past 9s and every alias showed
  // "Profile API timed out". Aliases now load 5 at a time, so each request
  // finishes well inside its timeout. (loadHeichelosForAlias never throws —
  // a failure is recorded in state.heichelErrors and shown as an error card.)
  const aliases = state.aliases || [];
  const items = [];
  for (let start = 0; start < aliases.length; start += 5) {
    const batch = aliases.slice(start, start + 5);
    const groups = await Promise.all(batch.map(loadHeichelosForAlias));
    items.push(...groups.flat());
  }
  const failures = Array.from(state.heichelErrors.entries());
  const children = [];
  if (!items.length && !failures.length) {
    children.push(emptyCard("No Heichelos yet. Open the forge from your alias and create a space."));
  }
  items.forEach(item => children.push(heichelCard(item.heichel, item.aliasId)));
  failures.forEach(([aliasId, message]) => {
    children.push(emptyCard(`@${aliasId}: ${message}`, "error"));
  });
  replaceWith(list, ...children);
  setStat("heichelos", String(items.length));
  if (failures.length) announceProfile("Some Heichelos could not load. The page stayed usable.", "error");
}
