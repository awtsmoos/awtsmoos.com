// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves generated production ingress preserves known identity and fails closed for unknown tenancy. */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	normalizeUpstream,
	renderHostingConfigs
} from '../hostingNginxConfig.mjs';

test('platform vhost keeps TLS while canonical site paths remain inside Node', () => {
	const { platform } = renderHostingConfigs();
	assert.match(platform, /server_name awtsmoos\.com www\.awtsmoos\.com;/);
	assert.match(platform, /listen 443 ssl;/);
	assert.match(platform, /ssl_certificate \/etc\/letsencrypt\/live\/awtsmoos\.com\/fullchain\.pem;/);
	assert.match(platform, /proxy_set_header Host \$host;/);
	assert.doesNotMatch(platform, /api\/social\/drive\/public/);
	assert.doesNotMatch(platform, /location ~ \^\/sites/);
});

test('tenant ingress is HTTP-only default, preserves Host, and reserves ACME space', () => {
	const { tenantHttp } = renderHostingConfigs();
	assert.match(tenantHttp, /listen 80 default_server;/);
	assert.match(tenantHttp, /listen \[::\]:80 default_server;/);
	assert.match(tenantHttp, /server_name _;/);
	assert.match(tenantHttp, /location \^~ \/\.well-known\/acme-challenge\//);
	assert.match(tenantHttp, /proxy_set_header Host \$host;/);
	assert.match(tenantHttp, /X-Forwarded-Host \$host/);
	assert.doesNotMatch(tenantHttp, /listen 443/);
	assert.doesNotMatch(tenantHttp, /ssl_certificate/);
});

test('renderer accepts only bounded local/production Node HTTP upstream forms', () => {
	assert.equal(normalizeUpstream('http://127.0.0.1:8080'), 'http://127.0.0.1:8080');
	assert.equal(normalizeUpstream('http://localhost:8080'), 'http://localhost:8080');
	assert.equal(normalizeUpstream('http://[2a01:4ff:f0:b153::1]:8080'), 'http://[2a01:4ff:f0:b153::1]:8080');
	for (const value of [
		'https://127.0.0.1:8080',
		'http://example.com:8080',
		'http://127.0.0.1:8080; return 200',
		'http://127.0.0.1:70000'
	]) {
		assert.throws(() => normalizeUpstream(value), /INVALID_AWTSMOOS_NODE_UPSTREAM/);
	}
});

test('ACME root is validated instead of injected as arbitrary Nginx syntax', () => {
	assert.match(renderHostingConfigs({ acmeRoot: '/srv/acme' }).tenantHttp, /root \/srv\/acme;/);
	assert.throws(
		() => renderHostingConfigs({ acmeRoot: '/srv/acme; return 200' }),
		/INVALID_ACME_ROOT/
	);
	assert.throws(
		() => renderHostingConfigs({ acmeRoot: '/srv/../etc' }),
		/INVALID_ACME_ROOT/
	);
});
