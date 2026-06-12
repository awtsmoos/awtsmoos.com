/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {armConstraint} from './armConstraint.js';import {legConstraint} from './legConstraint.js';import {headConstraint} from './headConstraint.js';import {footConstraint} from './footConstraint.js';
export function ikLite(pose,f,metrics){armConstraint(pose,'left');armConstraint(pose,'right');legConstraint(pose,'left');legConstraint(pose,'right');headConstraint(pose);footConstraint(pose,f,metrics);return pose}
