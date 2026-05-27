// B"H
/**
 * Chapter 15: platforms became wheels of judgment. They smile as bridges,
 * then rotate under the heel and throw pride into the abyss; still, the
 * Awtsmoos leaves rhythm enough for mastery inside the cruelty.
 */
export class RotatingPlatformField {
  /** @param {Array<object>} platforms raw unstable bridge data */
  constructor(platforms=[]){ this.platforms = platforms.map((p,i)=>({...p,id:i,angle:0,spin:p.spin||1,phase:p.phase||i*.7})); }
  /** @param {number} dt seconds */
  step(dt){ for(const p of this.platforms) p.angle += p.spin * dt; }
  /** @returns {Array<object>} collision-safe axis aligned bodies */
  bodies(){ return this.platforms.map(p => ({...p,tilt:Math.sin(p.angle+p.phase)})); }
  /** @param {object} player mutable player body @param {object} platform active platform */
  throwIfCruel(player, platform){
    const shove = Math.sin(platform.angle + platform.phase) * (platform.throw || 260);
    player.vx += shove * .018; if(Math.abs(shove) > 190) player.vy -= 18;
  }
}
