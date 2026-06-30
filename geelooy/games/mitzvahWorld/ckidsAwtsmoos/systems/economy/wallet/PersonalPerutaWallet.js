// B"H
/**
 * @file PersonalPerutaWallet.js
 * @description
 * Lord of JSDoc, Chapter Four: The One Purse Beneath Many Garments.
 *
 * The world had many names for the same little golden breath: `currency`,
 * `personalPerutas`, `inventory.personalPerutas`, `inventory.perutas`, and the
 * remembered storage jar. This module is the neutral bridge that lets every
 * existing system speak to one wallet without depending on a shop, a door, or a
 * HUD panel.
 *
 * Here the Awtsmoos gathers the scattered coins of state into one living pouch.
 * A merchant may deduct. A mezuzah may reward. A HUD may glow. LocalStorage may
 * remember. Yet none of them becomes a second wallet.
 */
import { walletNumber, wholeWalletNumber } from "./WalletNumbers.js";
import {
  readStoredPersonalPerutas,
  writeStoredPersonalPerutas
} from "./WalletStorage.js";
import { emitPersonalPerutas } from "./WalletEvents.js";

function mirroredMoneyValues(player) {
  return [
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
  moneyOf,
  setMoney
};
