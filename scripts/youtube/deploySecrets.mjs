#!/usr/bin/env node
// B"H
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dayuhSftpOps } from '../lib/dayuhSftpOps.mjs';
import { execOnAwtsmoosClient, openAwtsmoosSftp } from '../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../lib/safeSshPasswordStore.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '../..');
const localFile = resolveInput(process.argv[2]);
const remoteRoot = '/root/.awtsmoos-secrets/youtube';
const remoteFile = `${remoteRoot}/google-oauth.json`;
const expectedRedirect = 'https://awtsmoos.com/api/youtube/oauth/callback';

function resolveInput(argument) {
	if (argument) return resolve(argument);
	const parent = resolve(repositoryRoot, '..');
	const matches = readdirSync(parent)
		.filter(name => /^client_secret_.*\.json$/.test(name))
		.map(name => resolve(parent, name));
	if (matches.length !== 1) throw new Error('Pass the OAuth client JSON path explicitly.');
	return matches[0];
}

function validateClient(file) {
	const parsed = JSON.parse(readFileSync(file, 'utf8'));
	const client = parsed.web || parsed.installed;
	if (!client?.client_id || !client?.client_secret) throw new Error('OAuth JSON lacks a client ID or client secret.');
	if (!client.redirect_uris?.includes(expectedRedirect)) {
		throw new Error(`Google OAuth redirect URI must include ${expectedRedirect}`);
	}
	return { type: parsed.web ? 'web' : 'installed', redirects: client.redirect_uris.length };
}

function bootstrapCommand() {
	return `set -e
D='${remoteRoot}'
chmod 700 "$D"
chmod 600 "$D/google-oauth.json"
umask 077
[ -s "$D/session.key" ] || openssl rand -hex 32 > "$D/session.key"
[ -s "$D/tokens.key" ] || openssl rand -hex 32 > "$D/tokens.key"
mkdir -p "$D/users"
chmod 700 "$D/users"
chmod 600 "$D/session.key" "$D/tokens.key"
node - "$D/google-oauth.json" <<'NODE'
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const client = data.web || data.installed || {};
if (!client.client_id || !client.client_secret) process.exit(2);
console.log('oauth_json_valid=yes');
console.log('redirect_count=' + (client.redirect_uris || []).length);
NODE
printf 'secret_directory_mode='; stat -c '%a' "$D"
printf '\noauth_file_mode='; stat -c '%a' "$D/google-oauth.json"
printf '\nkey_files='; find "$D" -maxdepth 1 -type f -name '*.key' | wc -l
`;
}

const summary = validateClient(localFile);
const password = loadPassword();
if (!password) throw new Error('No Awtsmoos SSH password is stored in the macOS Keychain.');
const session = await openAwtsmoosSftp({ password });
try {
	const operations = dayuhSftpOps(session.sftp);
	await operations.upload(localFile, remoteFile, statSync(localFile).size);
	const result = await execOnAwtsmoosClient(session.client, bootstrapCommand());
	if (!result.ok) throw new Error(result.stderr || 'Remote secret bootstrap failed.');
	console.log(`B"H OAuth credentials installed through custom SFTP (${summary.type}, ${summary.redirects} redirect URI).`);
	console.log(String(result.stdout || '').trim());
} finally {
	session.close();
}
