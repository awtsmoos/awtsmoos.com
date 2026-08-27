
// B"H

import{applyViseme}from"../modifiers/mouthMod.js";

export function createMouthAnimation(visemeSequence){

    return{

        track:"speech",

        loop:false,

        keyframes:visemeSequence.map((v,i)=>({

            time:i*0.18,

            modifier:applyViseme(null,v)

        }))
    };
}
