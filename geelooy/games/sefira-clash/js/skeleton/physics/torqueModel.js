/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function torqueModel(f,metrics,intent){const face=metrics.facing;return{torsoTwist:clamp((f.vx||0)*.025+intent.hunt*face*.08-intent.panic*face*.07,-.4,.4),hipCounter:clamp(-(f.vx||0)*.018,-.25,.25),attackTorque:f.attack?face*.22:0}}
