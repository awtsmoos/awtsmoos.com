//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NetzachTrackCacheIndicator
 * @description
 * The Awtsmoos renews remote and local sound in one instant;
 * Awtsmoos.com lets this Netzach-like indicator reveal when a track has descended
 * into the offline vessel without injecting markup or disturbing row commands.
 */
class NetzachTrackCacheIndicator {
	/** Reflects asynchronous cache truth into one existing track row. */
	async mark(tiferesTrack, malchusItem, yesodCheckStatus) {
		try {
			const gevurahCached = await yesodCheckStatus(tiferesTrack.path);
			const netzachStatus = malchusItem.querySelector('.status-slot');
			const chesedCache = malchusItem.querySelector('.mini-cache');
			if (netzachStatus) {
				netzachStatus.replaceChildren();
				if (gevurahCached) {
					const hodDot = document.createElement('span');
					hodDot.className = 'cached-dot';
					hodDot.textContent = '●';
					netzachStatus.append(hodDot);
				}
			}
			chesedCache?.classList.toggle('saved', Boolean(gevurahCached));
		} catch {
			malchusItem.querySelector('.mini-cache')?.classList.remove('saved');
		}
	}
}

const netzachIndicator = new NetzachTrackCacheIndicator();

/** Stable public cache-status illuminator. */
export function markCacheStatus(tiferesTrack, malchusItem, yesodCheckStatus) {
	void netzachIndicator.mark(tiferesTrack, malchusItem, yesodCheckStatus);
}
