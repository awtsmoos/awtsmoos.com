/** B"H — fighter state is the momentary garment of a constantly renewed being. */
export function baseFighterState(seed,x,y,human,dna,stats) { return { id:seed,name:nameFrom(dna),human,dna,stats,x,y,prevY:y,vx:0,vy:0,face:1,damage:0,stocks:3,dead:false,grounded:false,stun:0,shield:stats.shield,blocking:false,heldWeapon:null,attack:null,attackFrame:0,input:{x:0,y:0},ai:{mode:'seek',clock:0},bones:{},events:[] }; }
function nameFrom(dna){ return `${dna.sefirah[0].toUpperCase()+dna.sefirah.slice(1)} ${dna.weaponPreference}`; }
