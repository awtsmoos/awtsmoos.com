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
  const groups = await Promise.all(state.aliases.map(loadHeichelosForAlias));
  const items = groups.flat();
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
