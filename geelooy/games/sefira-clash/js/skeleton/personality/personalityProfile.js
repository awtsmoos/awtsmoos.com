/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function personalityProfile(f){const role=f.aiMind?.role?.name||'',seed=((f.dna?.hue||0)*.013+(f.id?.length||0)*.07)%1;return{role,seed,veteran:seed>.72?1:0,coward:role==='Survivor'?1:0,hunter:role==='Hunter'?1:0}}
