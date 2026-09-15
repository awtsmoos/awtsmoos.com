//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file hostingNginxConfig.test.mjs
 * @description Proves generated production ingress preserves identity, bounded proxy targets, portable WebSocket headers, and safe security headers.
 * The Awtsmoos guards Awtsmoos.com at the threshold: transport and content boundaries are enforced now,
 * while CSP remains Report-Only until the larger platform has proven every legacy dependency against observation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	normalizeUpstream,
	renderHostingConfigs
} from '../hostingNginxConfig.mjs';

test('platform vhost keeps TLS, proxy identity, portable WebSockets, and safe response headers', () => {
	const { platform } = renderHostingConfigs();
	assert.match(platform, /server_name awtsmoos\.com www\.awtsmoos\.com;/);
	assert.match(platform, /listen 443 ssl;/);
	assert.match(platform, /ssl_certificate \/etc\/letsencrypt\/live\/awtsmoos\.com\/fullchain\.pem;/);
	assert.match(platform, /proxy_set_header Host \$host;/);
	assert.match(platform, /proxy_set_header Upgrade \$http_upgrade;/);
	assert.match(platform, /proxy_set_header Connection "upgrade";/);
	assert.doesNotMatch(platform, /\$connection_upgrade/);
	assert.match(platform, /Strict-Transport-Security "max-age=31536000" always;/);
	assert.match(platform, /X-Content-Type-Options "nosniff" always;/);
	assert.match(platform, /X-Frame-Options "SAMEORIGIN" always;/);
	assert.match(platform, /Referrer-Policy "strict-origin-when-cross-origin" always;/);
	assert.match(platform, /Permissions-Policy "browsing-topics=\(\)" always;/);
	assert.match(platform, /Content-Security-Policy-Report-Only/);
	assert.match(platform, /object-src 'none'/);
	assert.doesNotMatch(platform, /api\/social\/drive\/public/);
	assert.doesNotMatch(platform, /location ~ \^\/sites/);
});

test('tenant ingress remains HTTP-only default and reserves ACME space', () => {
	const { tenantHttp } = renderHostingConfigs();
	assert.match(tenantHttp, /listen 80 default_server;/);
	assert.match(tenantHttp, /listen \[::\]:80 default_server;/);
	assert.match(tenantHttp, /server_name _;/);
	assert.match(tenantHttp, /location \^~ \/\.well-known\/acme-challenge\//);
	assert.match(tenantHttp, /proxy_set_header Host \$host;/);
	assert.match(tenantHttp, /X-Forwarded-Host \$host/);
	assert.match(tenantHttp, /proxy_set_header Connection "upgrade";/);
	assert.doesNotMatch(tenantHttp, /Strict-Transport-Security/);
	assert.doesNotMatch(tenantHttp, /listen 443/);
	assert.doesNotMatch(tenantHttp, /ssl_certificate/);
});

test('renderer accepts only bounded local and production Node HTTP upstream forms', () => {
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
