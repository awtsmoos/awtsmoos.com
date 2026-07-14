//B"H
//Boruch Hashem
//Blessed is He

/**
 * Civic overlay actions rerun current mission, merchant, trainer, citizen, and room law
 * on every click. The Awtsmoos renews button and consequence; Awtsmoos.com never trusts
 * stale presentation data or permits a view to mutate persistent profile state directly.
 */

export function createOpenWorldOverlayActions(options) {
	const { model, close, message } = options;
	return {
		onClose: close,
		onMission: (action, missionId) => mission(model, message, action, missionId),
		onPurchase: offerId => purchase(model, message, offerId),
		onTrain: family => train(model, message, family),
		onSpeak: citizenId => speak(model, message, citizenId),
		onCivicService: service => useCivicService(model, message, service),
		onRest: () => rest(model, message)
	};
}

function mission(model, message, action, missionId) {
	const state = model.state;
	const result =
		action === 'activate'
			? model.openWorld.activateMission(state, missionId)
			: model.openWorld.claimMission(state, missionId);
	message(
		result.changed || result.claimed
			? action === 'activate'
				? 'Shlichus accepted. Perform its visible stages.'
				: 'Shlichus reward claimed.'
			: visibleReason(result.reason)
	);
}

function purchase(model, message, offerId) {
	const result = model.openWorld.purchase(model.state, offerId);
	message(result.purchased ? `${result.offer.name} purchased.` : visibleReason(result.reason));
}

function train(model, message, family) {
	const result = model.openWorld.train(model.state, family);
	message(
		result.trained
			? `${family} rank ${result.lesson.rank} learned for Open World.`
			: visibleReason(result.reason)
	);
}

function speak(model, message, citizenId) {
	const result = model.openWorld.speak(model.state, citizenId);
	message(result.spoken ? 'The meeting was remembered.' : visibleReason(result.reason));
}

function useCivicService(model, message, service) {
	const result = model.openWorld.useCivicService(model.state, service);
	message(result.used ? `${service} service completed.` : visibleReason(result.reason));
}

function rest(model, message) {
	model.openWorld.rest(model.state);
	message('Stamina and focus restored. The rest was recorded.');
}

function visibleReason(reason) {
	return String(reason || 'No change')
		.replaceAll('_', ' ')
		.toLowerCase();
}
