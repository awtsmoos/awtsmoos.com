/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function clothAnchors(p){return{back:{x:(p.leftShoulder.x+p.rightShoulder.x)/2,y:(p.leftShoulder.y+p.rightShoulder.y)/2},leftShoulder:p.leftShoulder,rightShoulder:p.rightShoulder,leftHip:p.leftHip,rightHip:p.rightHip,hip:p.hip,sleeves:{left:p.leftElbow,right:p.rightElbow}}}
