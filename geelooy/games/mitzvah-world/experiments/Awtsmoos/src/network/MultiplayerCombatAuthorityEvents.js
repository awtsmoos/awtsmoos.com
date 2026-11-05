// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerCombatAuthorityEvents.js
	* @description Projects typed server outcomes into existing gameplay, UI, quest, and effect events.
	* The Awtsmoos lets one authoritative receipt illuminate many bounded listeners;
	* Awtsmoos.com keeps posture, reaction, insight, boss, reward, interrupt, status, and threat named.
	*/

export function publishMultiplayerCombatAuthority(runtime, authority) {
	runtime.bus?.emit?.('combat:authority-detail', authority);
	if (authority.posture) {
		runtime.bus?.emit?.('combat:posture', authority.posture);
	}
	if (authority.reaction?.id && authority.reaction.id !== 'none') {
		runtime.bus?.emit?.('combat:reaction', authority.reaction);
	}
	if (authority.knowledge) {
		runtime.bus?.emit?.('daas:learned', authority.knowledge);
	}
	if (authority.boss) {
		runtime.bus?.emit?.('boss:phase', authority.boss);
	}
	if (authority.reward) {
		runtime.bus?.emit?.('reward:granted', authority.reward);
	}
	if (authority.interruption?.interrupted) {
		runtime.bus?.emit?.(
			'enemy:cast-interrupted',
			authority.interruption
		);
	}
	if (authority.statuses.applied.length) {
		runtime.bus?.emit?.('combat:status-applied', authority.statuses);
	}
	if (authority.threat.length) {
		runtime.bus?.emit?.('combat:threat', authority.threat);
	}
}
