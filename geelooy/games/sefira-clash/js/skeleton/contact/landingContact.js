/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function landingContact(pose,contact,metrics,body){const k=metrics.landingImpact||0;if(k<=0)return pose;const s=body.height;pose.leftFoot.y=contact.groundY;pose.rightFoot.y=contact.groundY;pose.leftFoot.x-=10*k*s;pose.rightFoot.x+=10*k*s;return pose}
