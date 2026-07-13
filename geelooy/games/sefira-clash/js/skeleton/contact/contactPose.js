//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the contact pose vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { groundContact } from './groundContact.js';
import { footPlant } from './footPlant.js';
import { heelToeRoll } from './heelToeRoll.js';
import { footSlideRecovery } from './footSlideRecovery.js';
import { landingContact } from './landingContact.js';
import { brakeContact } from './brakeContact.js';
import { pivotContact } from './pivotContact.js';
/**
 * Reveals the contact pose behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} pose The pose value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} metrics The metrics value entering this behavior.
 * @param {*} body The body value entering this behavior.
 */
export function contactPose(pose, f, metrics, body) {
	const contact = groundContact(f, metrics);
	footPlant(pose, contact, body);
	heelToeRoll(pose, contact, metrics, body);
	footSlideRecovery(pose, contact, metrics, body);
	landingContact(pose, contact, metrics, body);
	brakeContact(pose, contact, metrics, body);
	pivotContact(pose, contact, metrics, body);
	f.visualContact = contact;
	return pose;
}
