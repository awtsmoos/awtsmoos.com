/**
 * B"H
 * @module TorahCodexRuntime
 * @description Collection/progression runtime for routes, fusions, and soul builds.
 *
 * Chapter 168: The journal became a living sefer. The Awtsmoos has no body and
 * no form, yet the finite player wants progress bars: routes discovered, quotes
 * mastered, fusions awakened, and a class-like soul path inferred from the
 * teachings used most often.
 */
import { State } from '../../binah/State.js';
import { TorahFusionRecipes, TorahRouteFamilies, routeFamilyById, routeFamilyByTitle, zoneThemeForMap } from '../../data/concepts/TorahCodexIndex.js';

const emptyCodex = () => ({ routes: {}, quotes: {}, fusions: {}, affinity: { Mishnah: 0, Chassidus: 0, Kabbalah: 0, Niggun: 0 } });

export const ensureCodex = () => {
  State.TorahCodex ||= emptyCodex();
  State.TorahCodex.routes ||= {};
  State.TorahCodex.quotes ||= {};
  State.TorahCodex.fusions ||= {};
  State.TorahCodex.affinity ||= emptyCodex().affinity;
  return State.TorahCodex;
};

export const recordQuoteUse = move => {
  const codex = ensureCodex();
  const routeId = routeFamilyByTitle(move?.routeTitle) || move?.path?.routeId || 'avos';
  const quoteId = `${routeId}:${move?.chapterTitle || 'chapter'}:${move?.routeQuote || move?.name || 'quote'}`;
  const family = routeFamilyById(routeId);
  codex.routes[routeId] ||= { id: routeId, uses: 0, mastery: 0, name: family?.name || move?.routeTitle || routeId };
  codex.routes[routeId].uses += 1;
  codex.routes[routeId].mastery = masteryFromUses(codex.routes[routeId].uses);
  codex.quotes[quoteId] = (codex.quotes[quoteId] || 0) + 1;
  if (move?.category) codex.affinity[move.category] = (codex.affinity[move.category] || 0) + 1;
  const unlocked = unlockFusions();
  return { routeId, quoteId, unlocked };
};

export const discoverZoneRoute = mapId => {
  const theme = zoneThemeForMap(mapId);
  const codex = ensureCodex();
  codex.routes[theme.route] ||= { id: theme.route, uses: 0, mastery: 0, name: routeFamilyById(theme.route)?.name || theme.route };
  return theme;
};

export const unlockFusions = () => {
  const codex = ensureCodex();
  const unlocked = [];
  for (const recipe of TorahFusionRecipes) {
    const ready = recipe.needs.every(id => (codex.routes[id]?.uses || 0) > 0);
    if (ready && !codex.fusions[recipe.id]) {
      codex.fusions[recipe.id] = { id: recipe.id, name: recipe.name, quote: recipe.quote, bonus: recipe.bonus };
      unlocked.push(recipe.name);
    }
  }
  return unlocked;
};

export const fusionStats = () => Object.values(ensureCodex().fusions).reduce((sum, fusion) => {
  for (const [key, value] of Object.entries(fusion.bonus || {})) sum[key] = (sum[key] || 0) + value;
  return sum;
}, {});

export const soulClass = () => {
  const codex = ensureCodex();
  const [category] = Object.entries(codex.affinity).sort((a, b) => b[1] - a[1])[0] || ['Mishnah'];
  const names = { Mishnah: 'Source Trainer', Chassidus: 'Inner Flame', Kabbalah: 'Sefirah Weaver', Niggun: 'Joy Singer' };
  return { category, name: names[category] || 'Source Trainer', points: codex.affinity[category] || 0 };
};

export const codexSummary = () => {
  const codex = ensureCodex();
  const routes = Object.values(codex.routes).sort((a, b) => b.uses - a.uses);
  const fusions = Object.values(codex.fusions);
  const soul = soulClass();
  return { routes, fusions, soul, discovered: routes.length, quotes: Object.keys(codex.quotes).length };
};

export const codexRows = () => {
  const summary = codexSummary();
  const rows = [[`Soul Path`, `${summary.soul.name} (${summary.soul.points})`], [`Routes`, `${summary.discovered} discovered`], [`Quotes`, `${summary.quotes} used`], [`Fusions`, summary.fusions.map(f => f.name).join(', ') || 'None yet']];
  return rows.concat(summary.routes.slice(0, 4).map(r => [r.name, `${r.uses} uses • mastery ${r.mastery}`]));
};

const masteryFromUses = uses => uses >= 12 ? 3 : uses >= 5 ? 2 : uses >= 2 ? 1 : 0;
