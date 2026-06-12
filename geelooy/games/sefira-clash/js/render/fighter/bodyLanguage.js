/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export function renderLanguage(f){const i=f.poseIntent||{},st=f.visualStyle?.style||{},b=f.visualStyle?.body||{},clock=f.motionClock||0;return{lean:i.lean||computeLean(f),breath:Math.sin(clock*.08)*(2+(st.bounce||0)),damageWobble:(i.damageCurl||0)*Math.sin(clock*.31)*4,eyeScale:1+(i.panic||0)*.7+(f.danger?.35:0),torsoSquash:1+(f.anim?.squash||0)*1.4,confidence:i.confidence||0,panic:i.panic||0,hunt:i.hunt||0,attackGlow:f.attack?1:0,headSize:b.headSize||18,handSize:b.handSize||7,footSize:b.footSize||11,limbThickness:b.limbThickness||7}}
function computeLean(f){return Math.max(-.42,Math.min(.42,(f.vx||0)*.035+(f.fastFalling?(f.face||1)*.18:0)))}
