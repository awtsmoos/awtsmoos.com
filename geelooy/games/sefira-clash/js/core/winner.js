/**
 * B"H
 * Winner resolver.
 *
 * Chapter 122: victory may not vanish because a string was missed. Every frame
 * asks the simple question: who is alive? If only one soul remains, the gate
 * opens and the overlay becomes inevitable.
 */
export function resolveWinner(state) {
  if (state.winner) return state.winner;
  const alive = state.fighters.filter(f => !f.dead && f.stocks > 0);
  if (alive.length === 1) {
    state.winner = alive[0].name;
    return state.winner;
  }
  if (!alive.some(f => f.human) && alive.length > 0) {
    const best = alive.sort((a, b) => b.stocks - a.stocks || a.damage - b.damage)[0];
    state.winner = best.name;
    return state.winner;
  }
  return '';
}
