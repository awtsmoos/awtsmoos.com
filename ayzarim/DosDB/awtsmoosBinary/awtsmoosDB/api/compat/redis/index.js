// B"H — AwtsmoosDB Redis-compatible API entry point.
//
// Drop-in sketch for node-redis users:
//
//   const { createClient } = require('awtsmoosDB/api/compat/redis');
//   const client = createClient({ database: '/tmp/myapp.awtsdb' }); // 1-2 lines of setup
//   await client.connect();
//   await client.set('hello', 'world');
//   console.log(await client.get('hello')); // 'world'
//   await client.quit();
'use strict';

const { createClient, AwtsmoosRedisClient } = require('./client');

module.exports = { createClient, AwtsmoosRedisClient };
