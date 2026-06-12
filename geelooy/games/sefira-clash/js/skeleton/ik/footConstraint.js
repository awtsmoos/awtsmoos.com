/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function footConstraint(pose,f,metrics){if(!metrics.grounded)return pose;pose.leftFoot.y=Math.min(pose.leftFoot.y,f.y+4);pose.rightFoot.y=Math.min(pose.rightFoot.y,f.y+4);return pose}
