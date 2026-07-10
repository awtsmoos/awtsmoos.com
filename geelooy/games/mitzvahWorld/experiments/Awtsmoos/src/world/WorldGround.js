// B"H
import { Ray } from '../math/Ray.js';
import { normalize,v } from '../math/Geometry3D.js';

/**
 * Ground is searched from the player's vertical context, never from heaven.
 * A floor above the feet is a ceiling until the player actually climbs above
 * it; therefore upper stories cannot pull a walker upward through a slab.
 */
export class WorldGround{
  constructor({terrainHeightAt,octree,top=42}){Object.assign(this,{terrainHeightAt,octree,top});}
  sample(x,z,options={}){
    const terrain={height:this.terrainHeightAt(x,z),normal:this.terrainNormal(x,z),kind:'terrain',source:'terrain-height'};
    const maxY=Number.isFinite(options.maxY)?options.maxY:this.top;
    const originY=Math.max(terrain.height+.04,Math.min(this.top,maxY+.04));
    const maxDistance=Math.max(.08,originY-terrain.height+2);
    const hit=this.octree?.raycast(new Ray({x,y:originY,z},{x:0,y:-1,z:0}),maxDistance,floorOnly);
    if(!hit||hit.point.y<terrain.height-.001)return terrain;
    return{height:hit.point.y,normal:hit.item.normal,kind:hit.item.kind,source:'octree-bounded-floor-ray'};
  }
  heightAt(x,z,options={}){return this.sample(x,z,options).height;}
  isGrounded(position,footOffset=0,epsilon=.055){const feetY=position.y-footOffset,ground=this.heightAt(position.x,position.z,{maxY:feetY+epsilon});return feetY<=ground+epsilon;}
  terrainNormal(x,z){const e=.08,h=this.terrainHeightAt;return normalize(v(h(x-e,z)-h(x+e,z),2*e,h(x,z-e)-h(x,z+e)));}
}
function floorOnly(item){return item.solid&&item.floor&&item.normal?.y>.24;}
