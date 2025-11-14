// B"H
// example.js: A simple program to list files on a remote server.
// VERSION 2.0 - REWRITTEN FOR FOOLPROOF ASYNCHRONOUS EXECUTION

'use strict';

const { KeterClient } = require('../ayzarim/ssh/Keter-Client.js');

// --- Connection Details ---
const connectionConfig = {
  host: 'awtsmoos.com',
  port: 22,
  username: 'root',
  password: 'pecabihadKHRtWdiTgme',
  // Your debug function is perfect, keep it.
  debug: (msg) => { console.log(`[DEBUG] ${msg}`); }
};
// -------------------------

// We wrap our entire logic in a modern async function.
async function main() {
  console.log(`Connecting to ${connectionConfig.host}...`);
  const client = new KeterClient();

  try {
    // This is the core of the fix. We create a Promise that represents the
    // entire lifecycle of the connection. The 'await' keyword forces
    // our script to wait until this Promise either resolves (on success)
    // or rejects (on error). This prevents the premature exit.
    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        console.log('[LOG] TCP connection established. Starting SSH handshake...');
      });

      client.on('authenticated', () => {
        console.log('[LOG] Authentication successful!');
        console.log('[LOG] Requesting SFTP session...');

        client.sftp((err, sftp) => {
          if (err) {
            // If SFTP fails, reject the main promise.
            return reject(new Error(`Error starting SFTP session: ${err.message}`));
          }

          console.log('[LOG] SFTP session started. Reading root directory...');
          sftp.readdir('/', (err, list) => {
            if (err) {
              // If readdir fails, reject the main promise.
              return reject(new Error(`Error reading directory: ${err.message}`));
            }

            console.log('\n--- Contents of / directory ---');
            if (list.length > 0) {
              list.forEach(item => console.log(item.longname));
            } else {
              console.log('(Directory is empty)');
            }
            console.log('---------------------------------\n');
            
            // The entire operation was successful. Resolve the promise.
            resolve();
          });
        });
      });

      client.on('error', (err) => {
        // If any error occurs during the connection, reject the promise.
        reject(err);
      });

      client.on('close', (hadError) => {
        // If the connection closes before we are done, it's an error.
        // This is what was happening before.
        if (!hadError) {
          // We add a small delay to ensure this isn't a legitimate clean close
          // at the very end of the script.
          setTimeout(() => reject(new Error('Connection closed unexpectedly.')), 100);
        }
      });

      // Start the connection process.
      client.connect(connectionConfig);
    });

    console.log('[LOG] Operation complete.');

  } catch (error) {
    console.error(`[FATAL ERROR] An error occurred: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // This block ensures that the client connection is ALWAYS closed,
    // whether the operation succeeded or failed.
    console.log('[LOG] Cleaning up and closing connection.');
    client.end();
  }
}

// Run the main async function.
main();