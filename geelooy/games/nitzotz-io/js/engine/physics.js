// B'H
import { clamp, dist, heightAt, mix } from '../math.js';
export function suctionStep(obj,player,dt,worldIndex,power=1){const d=dist(player,obj),range=player.r*(5.5+power);if(d>range)return false;const q=clamp(1-d/range,0,1);obj.x+=(player.x-obj.x)*q*dt*(3.5+power);obj.y+=(player.y-obj.y)*q*dt*(3.5+power);obj.z=heightAt(obj.x,obj.y,worldIndex);return true}
export function spiralToward(a,p,dt){a.life-=dt;const t=1-a.life/.65,spin=t*12;a.x=mix(a.ox,p.x,t)+Math.cos(spin)*45*(1-t);a.y=mix(a.oy,p.y,t)+Math.sin(spin)*45*(1-t);a.z+=170*dt;a.rot+=dt*9;a.r*=.985;return a.life>0}
