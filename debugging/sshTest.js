//B"H
// B"H
// example.js: A simple program to list files on a remote server.

'use strict';

// 1. Import the main client from our new library.
const { KeterClient } = require('../ayzarim/ssh/Keter-Client.js');

// --- PLEASE CHANGE THESE DETAILS ---
const connectionConfig = {
  host: 'awtsmoos.com',
  port: 22,
  username: 'root',
  password: 'pecabihadKHRtWdiTgme',
  // For debugging, you can see the protocol messages.
   debug: (msg) => { console.log(`[DEBUG] ${msg}`); }
};
// -----------------------------------
const client = new KeterClient();

// The 'connect' event fires when the TCP connection is established.
client.on('connect', () => {
  console.log('[LOG] TCP connection established. Starting SSH handshake...');
});

client.on('authenticated', () => {
  console.log('[LOG] Authentication successful!');
  console.log('[LOG] Requesting SFTP session...');

  client.sftp((err, sftp) => {
    if (err) {
      console.error('[LOG] Error starting SFTP session:', err.message);
      client.end();
      return;
    }

    console.log('[LOG] SFTP session started. Reading root directory...');

    sftp.readdir('/', (err, list) => {
      if (err) {
        console.error('[LOG] Error reading directory:', err.message);
        client.end();
        return;
      }

      console.log('\n--- Contents of / directory ---');
      if (list.length > 0) {
        list.forEach(item => console.log(item.longname));
      } else {
        console.log('(Directory is empty)');
      }
      console.log('---------------------------------\n');
      
      console.log('[LOG] Listing complete. Closing connection.');
      client.end();
    });
  });
});

client.on('error', (err) => {
  console.error('[LOG] A connection error occurred:', err.message);
});

client.on('close', (hadError) => {
  console.log(`[LOG] Connection closed.${hadError ? ' due to an error.' : ''}`);
});

console.log(`Connecting to ${connectionConfig.host}...`);
client.connect(connectionConfig);;