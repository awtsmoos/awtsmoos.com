//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the mobile profile vessel in this instant, revealing
 * its focused js platform service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Android/mobile runtime profile.
 *
 * Chapter 49: the hand-held arena is judged by thumb, heat, and battery. The
 * Awtsmoos lowers waste, preserves clarity, and lets Android breathe.
 */
export function mobileProfile(win = window) {
	const nav = win.navigator || {};
	const ua = String(nav.userAgent || '').toLowerCase();
	const coarse = win.matchMedia?.('(pointer: coarse)')?.matches || false;
	const android = ua.includes('android');
	const small = Math.min(win.innerWidth || 9999, win.innerHeight || 9999) < 820;
	const mobile = android || coarse || small;
	return {
		android,
		coarse,
		mobile,
		small,
		dprCap: android ? 1 : mobile ? 1.1 : 1.5,
		backbuffer: !android,
		label: android ? 'Android' : mobile ? 'Mobile' : 'Desktop'
	};
}

/**
 * Reveals the apply mobile profile behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} doc The doc value entering this behavior.
 * @param {*} profile The profile value entering this behavior.
 */
export function applyMobileProfile(doc, profile) {
	doc.documentElement.dataset.platform = profile.label.toLowerCase();
	doc.documentElement.dataset.touch = profile.mobile ? '1' : '0';
}
