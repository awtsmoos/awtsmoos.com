/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function landingDustImpulse(f,m){const k=m.landingImpact||0;f.visualDustImpulse=k>.08?{x:f.x,y:f.y+2,power:k,life:10}:f.visualDustImpulse;return f.visualDustImpulse}
