//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file hostingNginxConfig.mjs
 * @description Renders complete production ingress vessels for Awtsmoos.com and custom tenant domains.
 * The Awtsmoos guards the public threshold without confusing protection with breakage: Awtsmoos.com enforces
 * stable transport/content boundaries while a broad Report-Only CSP observes legacy platform needs before enforcement.
 */

const DEFAULT_UPSTREAM = 'http://127.0.0.1:8080';
const DEFAULT_ACME_ROOT = '/var/www/letsencrypt';
const HOST_RE = /^(?:127\.0\.0\.1|localhost|\[[0-9a-f:]+\])$/i;
const PATH_RE = /^\/[A-Za-z0-9._/-]+$/;

const PLATFORM_HEADERS = Object.freeze([
	'add_header Strict-Transport-Security "max-age=31536000" always;',
	'add_header X-Content-Type-Options "nosniff" always;',
	'add_header X-Frame-Options "SAMEORIGIN" always;',
	'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
	'add_header Permissions-Policy "browsing-topics=()" always;',
	`add_header Content-Security-Policy-Report-Only "${reportOnlyPolicy()}" always;`
]);

export function renderHostingConfigs(options = {}) {
	const upstream = normalizeUpstream(options.upstream || DEFAULT_UPSTREAM);
	const acmeRoot = normalizeAcmeRoot(options.acmeRoot || DEFAULT_ACME_ROOT);
	return Object.freeze({
		platform: platformVhost(upstream),
		tenantHttp: tenantHttpVhost(upstream, acmeRoot)
	});
}

export function normalizeUpstream(value) {
	let url;
	try {
		url = new URL(String(value || ''));
	} catch {
		throw new Error('INVALID_AWTSMOOS_NODE_UPSTREAM');
	}
	if (url.protocol !== 'http:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
		throw new Error('INVALID_AWTSMOOS_NODE_UPSTREAM');
	}
	if (!HOST_RE.test(url.hostname) || !url.port || Number(url.port) > 65535) {
		throw new Error('INVALID_AWTSMOOS_NODE_UPSTREAM');
	}
	return `${url.protocol}//${url.host}`;
}

function normalizeAcmeRoot(value) {
	const root = String(value || '');
	if (!PATH_RE.test(root) || root.includes('..')) throw new Error('INVALID_ACME_ROOT');
	return root.replace(/\/$/, '');
}

function platformVhost(upstream) {
	return `server {
	listen 80;
	listen [::]:80;
	server_name awtsmoos.com www.awtsmoos.com;
	return 301 https://$host$request_uri;
}

server {
	listen 443 ssl;
	listen [::]:443 ssl;
	server_name awtsmoos.com www.awtsmoos.com;
	ssl_certificate /etc/letsencrypt/live/awtsmoos.com/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/awtsmoos.com/privkey.pem;
	${PLATFORM_HEADERS.join('\n\t')}
	${proxyLocation(upstream)}
}
`;
}

function tenantHttpVhost(upstream, acmeRoot) {
	return `server {
	listen 80 default_server;
	listen [::]:80 default_server;
	server_name _;
	location ^~ /.well-known/acme-challenge/ {
		root ${acmeRoot};
	}
	${proxyLocation(upstream)}
}
`;
}

function proxyLocation(upstream) {
	return `location / {
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_pass ${upstream};
	}`;
}

function reportOnlyPolicy() {
	return [
		"default-src 'self' https: data: blob:",
		"script-src 'self' https: blob: 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
		"style-src 'self' https: 'unsafe-inline'",
		"img-src 'self' https: data: blob:",
		"font-src 'self' https: data:",
		"connect-src 'self' https: wss: ws:",
		"media-src 'self' https: data: blob:",
		"worker-src 'self' blob:",
		"frame-src 'self' https:",
		"object-src 'none'",
		"base-uri 'self'",
		"frame-ancestors 'self'"
	].join('; ');
}
