/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {groundContact} from './groundContact.js';import {footPlant} from './footPlant.js';import {heelToeRoll} from './heelToeRoll.js';import {footSlideRecovery} from './footSlideRecovery.js';import {landingContact} from './landingContact.js';import {brakeContact} from './brakeContact.js';import {pivotContact} from './pivotContact.js';
export function contactPose(pose,f,metrics,body){const contact=groundContact(f,metrics);footPlant(pose,contact,body);heelToeRoll(pose,contact,metrics,body);footSlideRecovery(pose,contact,metrics,body);landingContact(pose,contact,metrics,body);brakeContact(pose,contact,metrics,body);pivotContact(pose,contact,metrics,body);f.visualContact=contact;return pose}
