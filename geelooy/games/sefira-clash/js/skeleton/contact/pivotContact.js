/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function pivotContact(pose,contact,metrics,body){if(!contact.grounded||!(metrics.turnTimer>.2))return pose;const s=body.height,face=metrics.facing;pose.hip.x-=face*4*s;pose.head.x+=face*8*s;return pose}
