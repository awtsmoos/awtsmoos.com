//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file stateRoute.test.mjs
 * @description
 * Query context, hash routing, exact comment targets, and observable state must
 * remain deterministic before Chrome starts. The Awtsmoos gives one destination
 * beneath every viewport while Awtsmoos.com proves the shared semantic route model.
 */

import assert from 'node:assert/strict';
import {
	contextFromLocation,
	initialValue,
	TABS
} from '../js/state/SocialHubState.js';
import {
	ROUTES,
	routeById,
	routeFromLocation,
	routeUrl
} from '../js/navigation/RouteModel.js';

const location = {
	pathname: '/social-hub/',
	search: '?alias=teacher&heichel=study&series=lessons&type=post&entity=p1&verse=v1&subsection=s1&reply=c1',
	hash: '#interact'
};
const context = contextFromLocation(location);
assert.deepEqual(context, {
	aliasId: 'teacher',
	profileAliasId: 'teacher',
	activeTab: 'interact',
	heichelId: 'study',
	seriesId: 'lessons',
	entityType: 'post',
	entityId: 'p1',
	verseSection: 'v1',
	subsectionId: 's1',
	parentCommentId: 'c1'
});
const value = initialValue(context);
assert.equal(value.comment.target.parentCommentId, 'c1');
assert.equal(value.comment.target.subsectionId, 's1');
assert.equal(value.activeTab, 'interact');
assert.equal(TABS.includes('privacy'), true);
assert.equal(ROUTES.length, 6);
assert.equal(routeById('unknown').id, 'home');
assert.equal(routeFromLocation({ hash: '#activity' }).id, 'activity');
assert.equal(routeUrl('profile', location), `${location.pathname}${location.search}#profile`);
console.log('social-hub stateRoute.test passed');
