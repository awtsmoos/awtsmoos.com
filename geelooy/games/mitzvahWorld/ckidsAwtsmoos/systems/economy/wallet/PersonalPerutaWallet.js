// B"H
/**
 * @file PersonalPerutaWallet.js
 * @description
 * Lord of JSDoc, Chapter Five: The Ancient Perutah Joins the One Purse.
 *
 * The shop, the mezuzah, the loot corpse, the repair bench, the quest giver,
 * the lava fall, and the sofer all used different pocket names for one owned
 * spendable light. This bridge refuses the civil war. It gathers `perutah`,
 * `currency`, `personalPerutas`, inventory mirrors, and the remembered storage
 * jar into one wallet covenant.
 *
 * Global score coins remain outside this vessel until proven otherwise. The
 * Awtsmoos lets level collectibles sparkle in their own river; this file owns
 * only the personal purse the player can spend, lose, earn, repair with, and
 * carry from one gameplay system to another.
 */
import { walletNumber, wholeWalletNumber } from "./WalletNumbers.js";
import {
  readStoredPersonalPerutas,
  writeStoredPersonalPerutas
} from "./WalletStorage.js";
import { emitPersonalPerutas } from "./WalletEvents.js";

export function bindWalletOlam(player, olam) {
  if (player && olam && !player.olam) player.olam = olam;
  return player || null;
}

export function walletPlayerOf(olam) {
  return bindWalletOlam(olam?.player || olam?.chossid || null, olam);
}

function mirroredMoneyValues(player) {
  return [
    walletNumber(player?.perutah),
    walletNumber(player?.currency),
    walletNumber(player?.personalPerutas),
    walletNumber(player?.inventory?.personalPerutas),
    walletNumber(player?.inventory?.perutas),
    readStoredPersonalPerutas(player)
  ];
}

export function moneyOf(player) {
  return Math.max(...mirroredMoneyValues(player));
}

export function setMoney(player, value, reason = "wallet sync") {
  if (!player) return 0;
  const before = moneyOf(player);
  const next = Math.max(0, wholeWalletNumber(value));

  player.perutah = next;
  player.personalPerutas = next;
  player.currency = next;

  if (player.inventory) {
    player.inventory.personalPerutas = next;
    player.inventory.perutas = next;
  }

  writeStoredPersonalPerutas(player, next);
  emitPersonalPerutas(player, next, next - before, reason);
  return next;
}

export function awardMoney(player, delta, reason = "reward") {
  return setMoney(player, moneyOf(player) + wholeWalletNumber(delta), reason);
}

export default {
  awardMoney,
  bindWalletOlam,
  moneyOf,
  setMoney,
  walletPlayerOf
};
