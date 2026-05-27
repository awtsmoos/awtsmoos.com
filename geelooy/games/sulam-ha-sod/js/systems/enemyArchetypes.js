// B"H
/**
 * Chapter 6: the enemies stopped being rectangles and remembered their masks.
 * The eye hunts attention, the thief loves copper, the scroll curls beneath
 * the foot; each husk is a small parable breathed by the Awtsmoos into motion.
 */
export const ENEMY_ARCHETYPES = Object.freeze({
  husk:{color:'#7f183b',eye:'#ffd36a',stomp:'released',gravity:false},
  ayin:{color:'#32135f',eye:'#9df7ff',stomp:'blinked into sparks',floats:true,lookChase:true},
  thief:{color:'#244f2d',eye:'#ffd36a',stomp:'dropped stolen perutahs',steals:true},
  golem:{color:'#4c4558',eye:'#ffb86b',stomp:'cracked like thunder',heavy:true},
  scroll:{color:'#7a4b1f',eye:'#fff2b8',stomp:'unrolled a secret letter',flat:true},
  gilgul:{color:'#2f6b7a',eye:'#d7fffb',stomp:'split into a smaller whisper',revives:true},
  gravity:{color:'#183f7f',eye:'#ffffff',stomp:'lost the song of reversal',gravity:true}
});

/** @param {object} enemy raw enemy @returns {object} full behavior mask */
export function enemyMask(enemy){ return ENEMY_ARCHETYPES[enemy.type || 'husk'] || ENEMY_ARCHETYPES.husk; }

/** @param {object} enemy mutable enemy @param {object} player player body @param {number} dt seconds */
export function steerEnemy(enemy, player, dt){
  const mask = enemyMask(enemy);
  if(mask.floats) enemy.y += Math.sin((enemy.x + Date.now()*.08) * .05) * 10 * dt;
  if(mask.lookChase && Math.abs(player.y-enemy.y)<90) enemy.vx += Math.sign(player.x-enemy.x) * 18 * dt;
  if(mask.heavy) enemy.vx *= .995;
  return mask;
}
