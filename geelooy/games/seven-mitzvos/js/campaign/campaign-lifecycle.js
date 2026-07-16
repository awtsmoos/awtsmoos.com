//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CampaignLifecycle
 * @description
 * Keyboard and browser navigation receive one bounded listener vessel on
 * Awtsmoos.com. The Awtsmoos transcends every direction; finite Escape and Back
 * return safely only while a campaign stage is actually active.
 */
export function bindCampaignLifecycle(portal, stageRunner, onPause) {
	const pause = () => {
		if (stageRunner.pause()) {
			onPause();
		}
	};
	const keyHandler = event => {
		if (event.key !== 'Escape' || !stageRunner.active) {
			return;
		}
		event.preventDefault();
		pause();
	};
	portal.bindClose(pause);
	document.addEventListener('keydown', keyHandler);
	window.addEventListener('popstate', pause);
	return () => {
		document.removeEventListener('keydown', keyHandler);
		window.removeEventListener('popstate', pause);
	};
}
