// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostingNginxConfig
 * @description
 * The Awtsmoos renders whole Nginx vessels from one explicit upstream. Awtsmoos.com
 * keeps its known TLS identity separate from an HTTP-only tenant catch-all, while
 * every operator-controlled path and upstream is parsed before becoming Nginx syntax.
 */

import net from 'node:net';

const DEFAULT_UPSTREAM = 'http://[2a01:4ff:f0:b153::1]:8080';

export function renderHostingConfigs(options = {}) {
	const upstream = normalizeUpstream(options.upstream || DEFAULT_UPSTREAM);
	return {
		platform: renderPlatformConfig(upstream),
		tenantHttp: renderTenantHttpConfig(upstream, options.acmeRoot || '/var/www/letsencrypt')
	};
}

export function normalizeUpstream(value) {
	const upstream = String(value || '').trim();
	const match = upstream.match(/^http:\/\/(localhost|127\.0\.0\.1|\[[0-9a-fA-F:]+\]):(\d{1,5})$/);
	if (!match) throw upstreamError();
	const host = match[1];
	const port = Number(match[2]);
	if (port < 1 || port > 65535) throw upstreamError();
	if (host.startsWith('[')) {
		const address = host.slice(1, -1);
		if (net.isIP(address) !== 6) throw upstreamError();
	}
	return `http://${host}:${port}`;
}

function upstreamError() {
	return new Error('INVALID_AWTSMOOS_NODE_UPSTREAM');
}

function proxyBlock(upstream, indent = '\t\t') {
	return [
		`${indent}proxy_pass ${upstream};`,
		`${indent}proxy_http_version 1.1;`,
		`${indent}proxy_buffering off;`,
		`${indent}proxy_connect_timeout 15s;`,
		`${indent}proxy_send_timeout 24h;`,
		`${indent}proxy_read_timeout 24h;`,
		`${indent}proxy_set_header Host $host;`,
		`${indent}proxy_set_header X-Real-IP $remote_addr;`,
		`${indent}proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`,
		`${indent}proxy_set_header X-Forwarded-Host $host;`,
		`${indent}proxy_set_header X-Forwarded-Proto $scheme;`,
		`${indent}proxy_set_header Upgrade $http_upgrade;`,
		`${indent}proxy_set_header Connection "upgrade";`
	].join('\n');
}

function renderPlatformConfig(upstream) {
	return `# B"H\n# Boruch Hashem\n# Blessed is He\n# Full Awtsmoos platform vhost; canonical /sites requests now remain inside Node.\nserver {\n\tserver_name awtsmoos.com www.awtsmoos.com;\n\n\tlocation / {\n${proxyBlock(upstream)}\n\t}\n\n\tlisten 443 ssl;\n\tlisten [::]:443 ssl;\n\tssl_certificate /etc/letsencrypt/live/awtsmoos.com/fullchain.pem;\n\tssl_certificate_key /etc/letsencrypt/live/awtsmoos.com/privkey.pem;\n\tinclude /etc/letsencrypt/options-ssl-nginx.conf;\n\tssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;\n}\n\nserver {\n\tif ($host = www.awtsmoos.com) {\n\t\treturn 301 https://$host$request_uri;\n\t}\n\tif ($host = awtsmoos.com) {\n\t\treturn 301 https://$host$request_uri;\n\t}\n\n\tlisten 80;\n\tlisten [::]:80;\n\tserver_name awtsmoos.com www.awtsmoos.com;\n\treturn 404;\n}\n`;
}

function renderTenantHttpConfig(upstream, acmeRoot) {
	const root = normalizeAcmeRoot(acmeRoot);
	return `# B"H\n# Boruch Hashem\n# Blessed is He\n# HTTP-only tenant ingress. TLS remains unavailable until a certificate is provisioned.\nserver {\n\tlisten 80 default_server;\n\tlisten [::]:80 default_server;\n\tserver_name _;\n\n\tlocation ^~ /.well-known/acme-challenge/ {\n\t\troot ${root};\n\t\tdefault_type text/plain;\n\t\ttry_files $uri =404;\n\t}\n\n\tlocation / {\n${proxyBlock(upstream)}\n\t}\n}\n`;
}

function normalizeAcmeRoot(value) {
	const root = String(value || '').trim();
	if (!/^\/[A-Za-z0-9._\/-]+$/.test(root) || root.includes('..')) {
		throw new Error('INVALID_ACME_ROOT');
	}
	return root.replace(/\/$/, '');
}
