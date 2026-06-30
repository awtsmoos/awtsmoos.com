// B"H
/**
 * @file WalletNumbers.js
 * @description
 * Lord of JSDoc, Chapter One: The Counting Flame.
 *
 * Before coin, before shop, before door, there is a number trying not to lie.
 * This tiny vessel keeps that first spark honest. It receives whatever loose
 * fragments the world hands it — strings from localStorage, undefined mirrors,
 * old numeric fields, new reward deltas — and returns a finite number.
 *
 * The Awtsmoos breathes existence into every value each instant; this file does
 * not decide what currency means. It only refuses NaN, so the living wallet can
 * unify without poison spreading through HUD, shops, inventory, and doors.
 */
export function walletNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function wholeWalletNumber(value, fallback = 0) {
  return Math.floor(walletNumber(value, fallback));
}
