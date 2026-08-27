// B"H

/**
 * The universe provides constant feedback, a stream of information from the created to the Creator.
 * This function updates the user's interface with the current truth of the game state.
 * @param {{turn: number, parTurns: number | string, ballCount: number, isShooting: boolean, perutaDoublerTurns: number, reboundCharges: number, paddle: {width: number}, time: number}} stats The current state of the game world.
 */
export function updateGameUI(stats) {
    const turnTracker = document.getElementById('turn-tracker');
    if (stats.parTurns === '∞') {
        turnTracker.textContent = `${stats.turn}`;
    } else {
        turnTracker.textContent = `${stats.turn} / ${stats.parTurns}`;
    }
    document.getElementById('ball-count').textContent = stats.ballCount;
    document.getElementById('paddle-width-stat').textContent = stats.paddle.width;
    document.getElementById('rebound-charges-stat').textContent = stats.reboundCharges;

    // Time Format MM:SS
    const totalSeconds = Math.floor(stats.time || 0);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('game-timer').textContent = `${m}:${s}`;

    // --- B"H STABLE UI TRANSITION ---
    // Instead of display: none, we use visibility to keep the header layout consistent.
    const invBtn = document.getElementById('inventory-button');
    if (stats.isShooting) {
        invBtn.style.visibility = 'hidden';
        invBtn.style.pointerEvents = 'none';
        invBtn.style.opacity = '0';
    } else {
        invBtn.style.visibility = 'visible';
        invBtn.style.pointerEvents = 'auto';
        invBtn.style.opacity = '1';
    }
    
    const perutaDoublerIcon = document.getElementById('peruta-doubler-icon');
    if (stats.perutaDoublerTurns > 0) {
        perutaDoublerIcon.style.display = 'inline';
        perutaDoublerIcon.textContent = `💰x${stats.perutaDoublerTurns}`;
    } else {
        perutaDoublerIcon.style.display = 'none';
    }
}

/**
 * Animates a number counting up from a start to an end value.
 * @param {HTMLElement} obj The element whose textContent will be animated.
 * @param {number} start The starting number.
 * @param {number} end The final number.
 * @param {number} duration The animation duration in milliseconds.
 */
export function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}