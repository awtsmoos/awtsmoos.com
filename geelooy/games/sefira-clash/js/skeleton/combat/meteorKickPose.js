/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {kickPose} from './kickPose.js';
export function meteorKickPose(p,f,m,body,intent,phase){p.chest.y+=8*body.height;p.head.x+=m.facing*10*body.height;return kickPose(p,f,m,body,intent,phase)}
