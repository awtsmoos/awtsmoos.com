/**
 * B"H
 * Winner resolver.
 *
 * Chapter 219: the human may fall and still witness the war. Victory is no
 * longer declared merely because the player is gone; the remaining bots keep
 * fighting until only one soul has stocks left. The screen becomes a window,
 * not a premature curtain.
 */
export function resolveWinner(state) {
  if (state.winner) return state.winner;
  const alive = state.fighters.filter(f => !f.dead && f.stocks > 0);
  if (alive.length === 1) {
    state.winner = alive[0].name;
    return state.winner;
  }
  return '';
}
