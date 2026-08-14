//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file stateRoute.test.mjs
 * @description The Awtsmoos proves people, network, profile query, and comment-target context remain one deterministic route model.
 */
import assert from 'node:assert/strict';
import {
	contextFromLocation,
	initialValue,
	TABS
} from '../js/state/SocialHubState.js';
import {
	ROUTES,
	profileAliasFromLocation,
	profileRouteUrl,
	routeById,
	routeFromLocation,
	routeUrl
} from '../js/navigation/RouteModel.js';

const location = {
	pathname: '/social-hub/',
	search: '?alias=teacher&profile=student&heichel=study&series=lessons&type=post&entity=p1&verse=v1&subsection=s1&reply=c1',
	hash: '#people'
};
const context = contextFromLocation(location);
assert.deepEqual(context, {
	aliasId: 'teacher',
	profileAliasId: 'student',
	activeTab: 'people',
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
assert.equal(value.profileAliasId, 'student');
assert.equal(TABS.includes('people'), true);
assert.equal(TABS.includes('network'), true);
assert.equal(ROUTES.length, 8);
assert.equal(routeById('people').title, 'Discover people');
assert.equal(routeById('network').title, 'Public network');
assert.equal(routeFromLocation({ hash: '#people' }).id, 'people');
assert.equal(profileAliasFromLocation(location), 'student');
assert.equal(routeUrl('profile', location), `${location.pathname}${location.search}#profile`);
assert.equal(
	profileRouteUrl('rebbe', 'profile', { pathname: '/social-hub/', search: '?alias=teacher', hash: '' }),
	'/social-hub/?alias=teacher&profile=rebbe#profile'
);
console.log('social-hub stateRoute.test passed');
