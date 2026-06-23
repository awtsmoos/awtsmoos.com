// B"H
export function audioIntent({distance=1,occluded=false,surface='grass',weather='clear'}={}){const far=Math.min(1,distance/120);return{volume:Math.max(.05,1-far*.9)*(occluded?.55:1),lowpassHz:occluded?1600:Math.max(2600,9000-far*5200),reverb:Math.min(1,far*.45+(weather==='rain'?.25:0)),footstep:`footstep-${surface}`,weatherBed:weather==='clear'?'birds-wind':`${weather}-wind-bed`}}
export default audioIntent;
