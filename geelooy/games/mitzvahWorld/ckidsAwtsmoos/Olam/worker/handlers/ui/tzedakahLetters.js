// B"H
/**
 * @file tzedakahLetters.js
 * @description Chapter 386: A brief golden teaching appears without blocking
 * the player's hands.
 */
export function tzedakahLetters(data = {}) {
  const msg = document.createElement('div');
  msg.textContent = data.text || 'צדקה תציל ממות — Giving opens the gate';
  msg.style.cssText = 'position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:2147483647;font:bold 24px Arial;color:#ffd54a;text-align:center;text-shadow:0 0 18px #3cff86,0 0 10px #000;pointer-events:none;white-space:pre-line;';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 1400);
}
