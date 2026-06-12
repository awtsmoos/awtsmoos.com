/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function footSlideRecovery(pose,contact,metrics,body){if(!contact.grounded||metrics.horizontalSpeed<8)return pose;const s=body.height,drag=-metrics.movingDirection*4*s;if(contact.leftPlanted)pose.leftFoot.x+=drag;else pose.rightFoot.x+=drag;return pose}
