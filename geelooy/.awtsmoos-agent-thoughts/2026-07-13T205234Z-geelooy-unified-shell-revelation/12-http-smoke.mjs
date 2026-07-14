// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module UnifiedShellHttpSmoke
 * @description
 * The Awtsmoos tests the public Awtsmoos.com vessels without mutating social
 * data, proving that each deep route reaches one shared shell entry over HTTP.
 */
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:8080';
const routes = [
	{
		path: '/post-editor?alias=verification&heichel=verification&series=root',
		marker: 'post-editor-root'
	},
	{
		path: '/heichel-editor?alias=verification&heichel=verification',
		marker: 'heichel-editor-root'
	},
	{
		path: '/comment-thread?heichel=verification&post=verification',
		marker: 'comment-thread-root'
	},
	{
		path: '/heichelos/submit',
		marker: 'data-geelooy-create-page',
		forbidRouteNavigation: true
	}
];

const report = [];
for (const route of routes) {
	const response = await fetch(`${origin}${route.path}`, { redirect: 'follow' });
	const html = await response.text();
	const shellBootCount = (html.match(/social\/shell\/boot\.js/g) || []).length;
	const navigationCount = (html.match(/<nav\b/g) || []).length;
	assert.equal(response.status, 200, `${route.path} must return HTTP 200`);
	assert.ok(html.includes(route.marker), `${route.path} must include ${route.marker}`);
	assert.equal(shellBootCount, 1, `${route.path} must load one shell boot`);
	if (route.forbidRouteNavigation) {
		assert.equal(navigationCount, 0, `${route.path} must not own global navigation`);
	}
	report.push({
		path: route.path,
		status: response.status,
		finalUrl: response.url,
		bytes: html.length,
		shellBootCount,
		navigationCount
	});
}

for (const asset of [
	'/scripts/awtsmoos/social/shell/boot.js?v=app-002',
	'/style/geelooy-app/index.css?v=app-002',
	'/heichelos/heichel/submit/shell-overrides.css?v=create-005'
]) {
	const response = await fetch(`${origin}${asset}`);
	assert.equal(response.status, 200, `${asset} must return HTTP 200`);
	report.push({ path: asset, status: response.status, finalUrl: response.url });
}

console.log(JSON.stringify(report, null, 2));
