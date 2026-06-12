/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function attackAnticipation(p,f,m,body,intent,phase){if(!f.attack||phase.anticipation<=0)return p;const s=body.height,face=m.facing,k=phase.anticipation;p.chest.x-=face*(8+intent.charge*6)*k*s;p.head.x-=face*4*k*s;p.hip.x+=face*3*k*s;p.leftFoot.x-=face*5*k*s;p.rightFoot.x+=face*7*k*s;return p}
