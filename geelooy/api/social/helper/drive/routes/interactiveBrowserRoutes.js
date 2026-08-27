//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exposes authenticated, ownership-checked, rate-bounded interactive browser actions.
 * @description The Awtsmoos gives each route a measured gate and guarded name;
 * Awtsmoos.com reveals living web control without exposing Chromium's hidden flame.
 */

const { InteractiveRateGate } = require('../browser/interactiveRateGate.js');
const { InteractiveSessionService } = require('../browser/interactiveSessionService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');
const { browserActor, browserRouteError } = require('./browserRouteActor.js');

const interactiveBrowserService = new InteractiveSessionService();
const interactiveRateGate = new InteractiveRateGate();
const actions = interactiveBrowserService.actions;

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/browser/sessions': variables => safeRoute(async () => {
		requireMethod($i, ['POST']);
		const actor = await browserActor({ variables, $i, userid });
		const body = bodyFor($i);
		return limited(actor, 'control', 'session.create', () => interactiveBrowserService.create({
			jarId: body.jarId,
			url: body.url,
			userId: actor.actorUserId
		}));
	}),
	'/drive/:aliasId/browser/sessions/:sessionId': variables => safeRoute(async () => {
		const actor = await browserActor({ variables, $i, userid });
		if ($i.request.method === 'DELETE') {
			return limited(actor, 'control', 'session.delete', () => interactiveBrowserService.deleteSession(
				actor.actorUserId,
				variables.sessionId
			));
		}
		requireMethod($i, ['GET']);
		return limited(actor, 'poll', 'session.metadata', () => actions.metadata(
			actor.actorUserId,
			variables.sessionId
		));
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		const actor = await browserActor({ variables, $i, userid });
		return limited(actor, 'poll', 'targets.list', async () => ({
			BH: 'B"H',
			targets: await actions.targets(actor.actorUserId, variables.sessionId)
		}));
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets/:targetId/frame': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		const actor = await browserActor({ variables, $i, userid });
		return limited(actor, 'frame', 'frame.capture', () => actions.frame(
			actor.actorUserId,
			variables.sessionId,
			variables.targetId,
			$i.$_GET?.quality
		));
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets/:targetId/navigate': variables => actionRoute({
		variables, $i, userid, lane: 'control', operation: 'navigate',
		action: (actor, body) => actions.navigate(actor.actorUserId, variables.sessionId, variables.targetId, body.url)
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets/:targetId/history': variables => actionRoute({
		variables, $i, userid, lane: 'control', operation: 'history',
		action: (actor, body) => actions.history(actor.actorUserId, variables.sessionId, variables.targetId, body.direction)
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets/:targetId/input': variables => actionRoute({
		variables, $i, userid, lane: 'input', operation: 'input',
		action: (actor, body) => actions.input(actor.actorUserId, variables.sessionId, variables.targetId, body)
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets/:targetId/cookies': variables => safeRoute(async () => {
		requireMethod($i, ['DELETE']);
		const actor = await browserActor({ variables, $i, userid });
		return limited(actor, 'control', 'cookies.clear', () => actions.clearCookies(
			actor.actorUserId,
			variables.sessionId,
			variables.targetId
		));
	}),
	'/drive/:aliasId/browser/sessions/:sessionId/targets/:targetId': variables => safeRoute(async () => {
		requireMethod($i, ['DELETE']);
		const actor = await browserActor({ variables, $i, userid });
		return limited(actor, 'control', 'target.close', () => actions.closeTarget(
			actor.actorUserId,
			variables.sessionId,
			variables.targetId
		));
	})
});

function actionRoute({ variables, $i, userid, lane, operation, action }) {
	return safeRoute(async () => {
		requireMethod($i, ['POST']);
		const actor = await browserActor({ variables, $i, userid });
		return limited(actor, lane, operation, () => action(actor, bodyFor($i)));
	});
}

async function limited(actor, lane, operation, action) {
	return routeCall(() => interactiveRateGate.run({
		userId: actor.actorUserId,
		lane,
		operation
	}, action));
}

async function routeCall(operation) {
	try {
		return await operation();
	} catch (error) {
		throw browserRouteError(error);
	}
}

module.exports.interactiveBrowserService = interactiveBrowserService;
module.exports.interactiveRateGate = interactiveRateGate;
