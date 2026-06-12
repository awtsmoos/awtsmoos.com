/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function groundContact(f,metrics){return{groundY:f.y+2,grounded:metrics.grounded,leftPlanted:metrics.footPhase<.5,rightPlanted:metrics.footPhase>=.5,contactPower:metrics.grounded?Math.min(1,metrics.horizontalSpeed/9):0}}
