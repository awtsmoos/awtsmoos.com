/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
export const airFlags=f=>({rise:!f.grounded&&(f.vy||0)<-1,fall:!f.grounded&&(f.vy||0)>1,apex:!f.grounded&&Math.abs(f.vy||0)<=1.4,fastFall:!f.grounded&&!!f.fastFalling});
