// B"H
/**
 * @file WalletEvents.js
 * @description
 * Lord of JSDoc, Chapter Three: The Herald of the Purse.
 *
 * A number hidden in state is not yet a game feeling. The player must see the
 * spark arrive. The HUD must hear it. Debug listeners must be able to remember
 * it. This module does only that: it announces one already-resolved wallet
 * value and one delta through the event names the world already uses.
 *
 * No merchant lives here. No door lives here. No loot table lives here. Only the
 * herald stands at the crossing and says: the purse changed; let every mirror
 * update from the same truth.
 */
export function emitPersonalPerutas(player, value, delta, reason) {
  const payload = {
    personalPerutas: value,
    delta,
    personalDelta: delta,
    reason
  };

  player?.olam?.ayshPeula?.("ui event", "gameHUD", {
    personalPerutas: payload
  });

  player?.olam?.ayshPeula?.("ui event", "personalPerutas", payload);

  return payload;
}
