/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export function updateMotionMemory(f){const m=f.visualMotion||={previousX:f.x,previousY:f.y,previousVx:f.vx||0,previousVy:f.vy||0,previousFacing:f.face||1,footPhase:0,lastGroundedFrame:0,lastLandingImpact:0,visualTurnTimer:0};const wasAir=!m.previousGrounded&&f.grounded,sp=Math.abs(f.vx||0);m.footPhase=(m.footPhase+(f.grounded?.08+sp*.018:.035))%1;m.visualTurnTimer=Math.sign(f.vx||f.face||1)!==Math.sign(m.previousFacing||1)?1:Math.max(0,m.visualTurnTimer-.08);m.lastLandingImpact=wasAir?Math.max(0,(m.previousVy||0)-8)*.06:Math.max(0,m.lastLandingImpact-.05);if(f.grounded)m.lastGroundedFrame=f.motionClock||0;m.previousX=f.x;m.previousY=f.y;m.previousVx=f.vx||0;m.previousVy=f.vy||0;m.previousFacing=f.face||1;m.previousGrounded=!!f.grounded;return m}
