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
  // B"H social fix 14 (defect 2): the Heichelos tab showed a permanent
  // "Something needs attention" error card for any alias whose
  // heichelos/details call timed out — and there was NO retry, so a
  // transient timeout stayed a failure forever. The endpoint is fast
  // when unloaded (97–570ms for the 5 warning aliases, probed live),
  // so the timeouts are contention-driven: the profile boots ~25
  // concurrent slow requests on a 2-CPU box. One bounded retry (1s
  // backoff, 15s timeout on the retry, same 5-at-a-time batching — no
  // extra concurrency), mirroring the Fix 13 posts retry. If the retry
  // also fails, the error card still shows — a persistent failure is
  // reported honestly, not hidden.
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const list = await getHeichelosForAlias(alias.id, attempt === 0 ? 9000 : 15000);
      state.heichelosByAlias.set(alias.id, list);
      state.heichelErrors.delete(alias.id);
      return list.map(heichel => ({ heichel, aliasId: alias.id }));
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  state.heichelosByAlias.set(alias.id, []);
  state.heichelErrors.set(alias.id, lastError?.message || "Could not load Heichelos.");
  return [];
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
  // B"H social fix 14 (defect 2): a transient timeout no longer leaves a
  // permanent error card — loadHeichelosForAlias retries once (1s backoff,
  // 15s timeout) before recording the failure.
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
