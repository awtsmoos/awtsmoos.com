/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function confidencePose(p,f,intent,body){const s=body.height,k=intent.confidence||0;p.chest.y-=6*k*s;p.head.y-=4*k*s;p.leftShoulder.x-=4*k*s;p.rightShoulder.x+=4*k*s;return p}
