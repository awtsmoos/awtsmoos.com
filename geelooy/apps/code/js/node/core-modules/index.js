
// B"H
/**
 * @file index.js
 * @brief The Registry of the Golem's Organs.
 * We stringify these polyfills to inject them into the Web Worker synchronously.
 */

import { eventsModule } from './events.js';
import { bufferModule } from './buffer.js';
import { netModule } from './net.js';
import { httpModule } from './http.js';
import { cryptoModule } from './crypto.js';

export const NodeCoreModules = {
    'events': eventsModule,
    'buffer': bufferModule,
    'net': netModule,
    'http': httpModule,
    'crypto': cryptoModule
};
