/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews every edit decision at the exact frame where it belongs.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.active = function active(items, timeMs) {
	return (items || []).find(item => (
		timeMs >= item.start
		&& timeMs < item.start + item.duration
	)) || null;
};

AnimatorVideo.activeShot = function activeShot(timeMs) {
	const plan = AnimatorVideo.state.plan;
	return AnimatorVideo.active(plan.shots, timeMs) || plan.shots[plan.shots.length - 1];
};

AnimatorVideo.activeSequence = function activeSequence(shot) {
	return AnimatorVideo.state.plan.sequences.find(sequence => sequence.id === shot.sequenceId);
};

AnimatorVideo.activeDialogue = function activeDialogue(timeMs) {
	return AnimatorVideo.active(AnimatorVideo.state.plan.dialogue, timeMs);
};

AnimatorVideo.performance = function performance(characterId, timeMs) {
	return (AnimatorVideo.state.plan.performances || [])
		.filter(item => (
			item.characterId === characterId
			&& timeMs >= item.start
			&& timeMs < item.start + item.duration
		))
		.reduce((state, item) => ({
			...state,
			...item.payload,
			activeIds: [...state.activeIds, item.id]
		}), { activeIds: [] });
};

AnimatorVideo.visibleCharacters = function visibleCharacters(shot) {
	return AnimatorVideo.state.plan.characters.filter(character => (
		shot.characters.includes(character.identityId)
	));
};
