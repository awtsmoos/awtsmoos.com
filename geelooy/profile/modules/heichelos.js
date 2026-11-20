// B"H
/**
 * @module ProfileHeichelos
 * @description
 * Chapter 24: The Awtsmoos refuses silent Heichel failure. Each alias load is
 * captured as data, empty state, or visible error card.
 */
import { announceProfile, one, replaceWith, setStat } from "./dom.js";
import { emptyCard, heichelCard } from "./cards.js";
import { getHeichelosForAlias, getHeichelosOverview } from "./api.js";
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

/**
 * Loads every alias through the per-alias route, 5 at a time.
 * (loadHeichelosForAlias never throws — a failure is recorded in
 * state.heichelErrors and shown as an error card.) This is the FALLBACK
 * path since round 2; the primary path is the one-request overview in
 * renderHeichelos below.
 * B"H social fix 1: batched. The old code fired one heichelos/details request
 * per alias at once (~40) with a 9s per-request timeout; under the profile's
 * ~160-call load they queued past 9s and every alias showed
 * "Profile API timed out". Aliases now load 5 at a time, so each request
 * finishes well inside its timeout.
 * B"H social fix 14 (defect 2): a transient timeout no longer leaves a
 * permanent error card — loadHeichelosForAlias retries once (1s backoff,
 * 15s timeout) before recording the failure.
 */
async function loadAllPerAlias(aliases) {
  for (let start = 0; start < aliases.length; start += 5) {
    const batch = aliases.slice(start, start + 5);
    await Promise.all(batch.map(loadHeichelosForAlias));
  }
}

/**
 * B"H 2026-11-20 round 2: the primary load is ONE aggregate request for
 * the whole account (getHeichelosOverview → /heichelos/mine/details),
 * retried once. The round-1-era fan-out — one request per alias, 46 for
 * this account, each an independent cold walk — timed out leg by leg
 * under load and the tab rendered 46 "Profile API timed out" error
 * cards (rendered check 2026-11-20 03:41–04:05 UTC). The aggregate
 * walks the same lists server-side behind the profile read memo, so
 * the tab now pays at most one cold walk total, and any alias the
 * server could not finish arrives as a per-alias error entry that is
 * shown the same honest way as before. If the aggregate itself fails,
 * the old per-alias batched path runs as the fallback, and any alias
 * missing from the overview is filled in per-alias too.
 */
async function loadOverview(aliases) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const groups = await getHeichelosOverview(30000);
      const byAlias = new Map(groups.map(group => [String(group?.aliasId || ""), group]));
      for (const alias of aliases) {
        const group = byAlias.get(String(alias.id));
        if (group && !group.error && Array.isArray(group.heichelos)) {
          state.heichelosByAlias.set(alias.id, group.heichelos);
          state.heichelErrors.delete(alias.id);
        } else if (group && group.error) {
          state.heichelosByAlias.set(alias.id, []);
          state.heichelErrors.set(alias.id, String(group.error));
        }
      }
      return true;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

export async function renderHeichelos() {
  const list = one(".heichel-list");
  if (!list) return;
  replaceWith(list, emptyCard("Loading your Heichelos…", "loading"));
  const aliases = state.aliases || [];
  // A fresh render is a fresh attempt (the pre-round-2 behavior): drop
  // this tab's previous results/errors for the current aliases so a
  // revisit retries instead of re-showing a stale failure.
  for (const alias of aliases) {
    state.heichelosByAlias.delete(alias.id);
    state.heichelErrors.delete(alias.id);
  }
  await loadOverview(aliases);
  const unresolved = aliases.filter(alias =>
    !state.heichelosByAlias.has(alias.id) && !state.heichelErrors.has(alias.id)
  );
  if (unresolved.length) await loadAllPerAlias(unresolved);
  const items = [];
  for (const alias of aliases) {
    const owned = state.heichelosByAlias.get(alias.id) || [];
    owned.forEach(heichel => items.push({ heichel, aliasId: alias.id }));
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
