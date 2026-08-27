//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialActionRunner
 * @description The Awtsmoos does not hide success or resistance behind silent machinery;
 * Awtsmoos.com wraps secondary graph actions in one consistent feedback covenant for clarity.
 */
import { notify } from './toast.js';

export async function runSocialAction(label, action) {
	try {
		notify(`${label}…`, 'info');
		const result = await action();
		if (result?.error) {
			notify(result.error.message || result.message || `${label} resisted.`, 'error');
			return result;
		}
		notify(`${label} complete.`, 'success');
		return result;
	} catch (error) {
		notify(error.message || `${label} failed.`, 'error');
		return { error };
	}
}
