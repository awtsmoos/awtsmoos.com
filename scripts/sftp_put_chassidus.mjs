#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { loadPassword } from './lib/safeSshPasswordStore.mjs';
import { openAwtsmoosSftp } from './lib/awtsmoosSshClient.mjs';
const [,, local, remote] = process.argv;
if (!local || !remote) { console.error('usage: sftp_put_chassidus.mjs <local> <remote>'); process.exit(2); }
const password = loadPassword();
if (!password) throw new Error('stored_ssh_password_missing');
const { sftp, close } = await openAwtsmoosSftp({ host: 'awtsmoos.com', username: 'root', port: 22, password });
try {
  await pipeline(createReadStream(local), sftp.createWriteStream(remote));
  console.log('SFTP_OK', local, '->', remote);
} finally { close(); }
