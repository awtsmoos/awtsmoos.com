//B"H

/**
 * Chapter 280: The Echo Judge Learned Mercy.
 *
 * A user may say `Hey`, and the assistant may answer `Hey! What can I help
 * with?` That is not an echo; it is speech answering speech. The Awtsmoos
 * hides in the difference between repetition and response, so this guard now
 * rejects only exact or near-identical long mirrors.
 *
 * @param {object|string|null} packet Stream packet candidate.
 * @returns {boolean} true only for literal hard done packets.
 */
export function isDonePacket(packet) {
  return packet === "[DONE]"
    || packet?.dataNoJSON === "[DONE]"
    || packet?.data?.dataNoJSON === "[DONE]";
}

/**
 * B"H — decides whether assistant text is merely the user prompt replaying.
 *
 * Short prompts are allowed to appear inside natural answers. Longer prompts
 * are blocked only when the candidate is almost entirely the same vessel.
 *
 * @param {object} renderer Message renderer with `lastUserText()`.
 * @param {string} text Candidate assistant text.
 * @returns {boolean} true when text should be ignored as a user echo.
 */
export function looksLikeUserEcho(renderer, text) {
  const previous = compact(renderer.lastUserText?.() || "");
  const current = compact(text);
  if (!previous || !current) return false;
  if (current === previous) return true;
  if (previous.length < 18) return false;
  const longer = Math.max(previous.length, current.length);
  const shorter = Math.min(previous.length, current.length);
  if (shorter / longer < 0.82) return false;
  return current.includes(previous) || previous.includes(current);
}

/**
 * B"H — compresses whitespace into one quiet river.
 *
 * @param {unknown} value Any text-like value.
 * @returns {string} Trimmed, single-space text.
 */
export function compact(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}
