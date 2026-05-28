// B"H
const LETTERS = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
const COLORS = ['#ffffff', '#ffd36a', '#9df7ff', '#ff6ad5', '#d7fffb'];

/**
 * Creates the spike-death shatter: blocks of body-color and Hebrew letters.
 *
 * The Awtsmoos breathes letters through every vessel; when the player hits a
 * spike, the vessel breaks into square fragments and visible otiyos. It is not
 * merely gore or noise: it is the code admitting that form was held together by
 * letters, and the trap scattered them across the chamber for one hot second.
 *
 * @param {object} player player rectangle and velocity.
 * @param {string} reason death reason used as flavor metadata.
 * @param {object} rng deterministic level random source.
 * @returns {object} particle burst data for renderer.
 */
export function spawnHebrewShatter(player, reason = '', rng) {
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;
  const particles = [];
  for (let i = 0; i < 34; i += 1) {
    const angle = (i / 34) * Math.PI * 2 + rand(rng) * 0.45;
    const speed = 110 + rand(rng) * 520;
    const isLetter = i % 3 === 0;
    particles.push({
      x: cx + (rand(rng) - 0.5) * player.w,
      y: cy + (rand(rng) - 0.5) * player.h,
      vx: Math.cos(angle) * speed + (player.vx || 0) * 0.25,
      vy: Math.sin(angle) * speed - 180 + (player.vy || 0) * 0.12,
      size: isLetter ? 20 + rand(rng) * 16 : 5 + rand(rng) * 13,
      rot: rand(rng) * Math.PI,
      spin: (rand(rng) - 0.5) * 9,
      life: 0.75 + rand(rng) * 0.7,
      maxLife: 1.45,
      letter: isLetter ? LETTERS[Math.floor(rand(rng) * LETTERS.length)] : '',
      color: COLORS[Math.floor(rand(rng) * COLORS.length)]
    });
  }
  return { x: cx, y: cy, reason, life: 1.45, particles };
}

/**
 * Advances death bursts with gravity and fade.
 * @param {object[]} bursts active bursts.
 * @param {number} dt seconds elapsed.
 * @returns {object[]} still-visible bursts.
 */
export function stepBursts(bursts = [], dt) {
  for (const burst of bursts) {
    burst.life -= dt;
    for (const p of burst.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 980 * dt;
      p.rot += p.spin * dt;
    }
    burst.particles = burst.particles.filter(p => p.life > 0);
  }
  return bursts.filter(burst => burst.life > 0 && burst.particles.length > 0);
}

function rand(rng) {
  return rng?.next?.() ?? Math.random();
}
