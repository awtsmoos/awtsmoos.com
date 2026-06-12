/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function heelToeRoll(pose,contact,metrics,body){if(!contact.grounded)return pose;const s=body.height,roll=Math.sin(metrics.footPhase*Math.PI*2)*Math.min(1,metrics.horizontalSpeed/10);pose.leftFoot.y+=Math.max(0,roll)*2*s;pose.rightFoot.y+=Math.max(0,-roll)*2*s;return pose}
