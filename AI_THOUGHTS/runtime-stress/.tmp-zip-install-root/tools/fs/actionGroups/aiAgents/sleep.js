// B"H

/**
 * B"H
 * Chapter 354: The Clock Became A Quiet Servant.
 *
 * The Awtsmoos renews every instant, yet the delegate forest must breathe in
 * measured intervals so status polling does not become thunder without vessels.
 *
 * @param {number} ms Milliseconds to pause.
 * @returns {Promise<void>} Resolves after the pause.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms || 0))));
}

module.exports = { sleep };
