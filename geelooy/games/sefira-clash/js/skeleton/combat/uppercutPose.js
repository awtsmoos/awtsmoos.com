/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {punchPose} from './punchPose.js';
export function uppercutPose(p,f,m,body,intent,phase){p.chest.y+=10*phase.anticipation*body.height;p.leftHand.y+=14*phase.anticipation*body.height;return punchPose(p,f,m,body,intent,phase)}
