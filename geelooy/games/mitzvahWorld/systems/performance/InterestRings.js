// B"H
export const RINGS=Object.freeze({near:{radius:80,hz:10,quality:1},mid:{radius:220,hz:4,quality:.65},far:{radius:520,hz:1,quality:.35},horizon:{radius:Infinity,hz:0,quality:.12}});
export function distance2(a={},b={}){const dx=(a.x||0)-(b.x||0),dz=(a.z||0)-(b.z||0);return dx*dx+dz*dz}
export function interestRing(pos,player){const d=Math.sqrt(distance2(pos,player));for(const [name,r]of Object.entries(RINGS))if(d<=r.radius)return{name,distance:d,...r};return{name:"horizon",distance:d,...RINGS.horizon}}
export default {RINGS,interestRing,distance2};
