// B"H
/**
 * @file WalletStorage.js
 * @description
 * Lord of JSDoc, Chapter Two: The Remembering Pouch.
 *
 * LocalStorage is not the soul of the wallet, but it is the little clay jar
 * where the current session hides perutas between door, shop, HUD, and reload.
 * This file isolates that jar so no feature has to know the storage key by
 * rumor. One key, one guarded read, one guarded write.
 *
 * When the Awtsmoos recreates the world from nothing, this bridge remembers the
 * last known purse without pretending to own gameplay. It is storage, not a
 * second economy.
 */
import { wholeWalletNumber } from "./WalletNumbers.js";

export const PERSONAL_PERUTAS_STORAGE_KEY = "awtsmoosMitzvahPersonalPerutas";

export function walletStorageScope(player) {
  return player?.olam?.aysh?.window || player?.olam?.window || globalThis;
}

export function readStoredPersonalPerutas(player) {
  try {
    return wholeWalletNumber(
      walletStorageScope(player)?.localStorage?.getItem(PERSONAL_PERUTAS_STORAGE_KEY),
      0
    );
  } catch {
    return 0;
  }
}

export function writeStoredPersonalPerutas(player, value) {
  try {
    walletStorageScope(player)?.localStorage?.setItem(
      PERSONAL_PERUTAS_STORAGE_KEY,
      String(Math.max(0, wholeWalletNumber(value)))
    );
  } catch {}
}
