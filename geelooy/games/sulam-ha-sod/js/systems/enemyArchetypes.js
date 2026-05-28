// B"H
/** Enemy archetypes for Sulam HaSod.
 *
 * The Awtsmoos animates each adversary as a test of habit: some pretend to die,
 * some refuse stomps, some wake only when seen, and some herd a careless runner
 * toward teeth. Data stays declarative; behavior is selected through masks.
 */
export const ENEMY_ARCHETYPES = Object.freeze({
  husk: { color: '#7f183b', eye: '#ffd36a', stomp: 'released', stompable: true },
  ayin: { color: '#32135f', eye: '#9df7ff', stomp: 'blinked into sparks', floats: true, lookChase: true, chaser: true, stompable: true },
  thief: { color: '#244f2d', eye: '#ffd36a', stomp: 'dropped stolen perutahs', steals: true, stompable: true },
  golem: { color: '#4c4558', eye: '#ffb86b', stomp: 'refused the stomp', heavy: true, armored: true, stompable: false },
  scroll: { color: '#7a4b1f', eye: '#fff2b8', stomp: 'unrolled a secret letter', stompable: true },
  gilgul: { color: '#2f6b7a', eye: '#d7fffb', stomp: 'split into a smaller whisper', revives: true, stompable: true },
  gravity: { color: '#183f7f', eye: '#ffffff', stomp: 'bent the stomp back upward', armored: true, chaser: true, stompable: false },
  feign: { color: '#57215f', eye: '#fff2b8', stomp: 'played dead and twitched again', revives: true, fakeDeath: true, stompable: true },
  watcher: { color: '#161f68', eye: '#9df7ff', stomp: 'lost eye contact', lookChase: true, wakeRange: 430, chaser: true, stompable: true },
  leaper: { color: '#6b2918', eye: '#ffe28a', stomp: 'fell from its leap', leap: true, stompable: true },
  herder: { color: '#2c3820', eye: '#ff2f6d', stomp: 'stopped herding you', herd: true, chaser: true, stompable: false },
  baitGuard: { color: '#4b2b13', eye: '#ffd36a', stomp: 'guarded the bait from below', guardBait: true, armored: true, stompable: false }
});

export const enemyMask = e => ENEMY_ARCHETYPES[e.type || 'husk'] || ENEMY_ARCHETYPES.husk;

export function steerEnemy(e, player, dt) {
  const m = enemyMask(e);
  if (m.floats) e.y += Math.sin((e.x + Date.now() * 0.08) * 0.05) * 10 * dt;
  if (shouldChase(e, player, m)) e.vx += Math.sign(player.x - e.x) * (e.chase || 240) * dt;
  if (m.herd) e.vx += Math.sign((e.herdTo || e.max) - player.x) * (e.herdForce || 150) * dt;
  if (m.guardBait && Math.abs(player.x - e.x) < 220) e.vx += Math.sign(e.x - player.x) * (e.guardForce || 210) * dt;
  if (m.leap) maybeLeap(e, player, dt);
  if (m.heavy) e.vx *= 0.992;
  const cap = e.cap || 260;
  e.vx = Math.max(-cap, Math.min(cap, e.vx));
  return m;
}

function shouldChase(e, player, mask) {
  const xRange = mask.wakeRange || 360;
  const yRange = e.yRange || 130;
  return (mask.lookChase || mask.chaser) && Math.abs(player.y - e.y) < yRange && Math.abs(player.x - e.x) < xRange;
}

function maybeLeap(e, player, dt) {
  e.leapClock = (e.leapClock || 0) - dt;
  const aligned = Math.abs(player.x - e.x) < (e.leapRange || 170) && player.y < e.y + 80;
  if (!aligned || e.leapClock > 0) return;
  e.vx += Math.sign(player.x - e.x) * (e.leapPush || 420);
  e.y -= e.leapLift || 34;
  e.leapClock = e.leapDelay || 1.6;
}
