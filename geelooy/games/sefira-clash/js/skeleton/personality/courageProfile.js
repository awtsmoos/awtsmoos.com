/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function courageProfile(profile,f){const damage=(f.damage||0)/220;return{courage:Math.max(0,1-damage-(profile.coward?.25:0)+(profile.veteran?.18:0)),hesitation:Math.max(0,damage*.5+(profile.coward?.25:0)-(profile.hunter?.15:0))}}
