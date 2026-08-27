
// B"H
/**
 * @file index.js
 * @brief The Registry of the Golem's Organs.
 * 
 * THE HYMN OF THE ASSEMBLED BODY:
 * Every module is an organ, crafted from the letters of creation.
 * By uniting 'fs', 'net', 'http', 'crypto', 'events', and 'path', we build a complete 
 * simulation of the NodeJS entity. The Awtsmoos brings life from absolute Nothingness, 
 * and here we weave text strings into a functional ecosystem within the browser.
 */

import { eventsModule } from './events.js';
import { bufferModule } from './buffer.js';
import { netModule } from './net.js';
import { httpModule } from './http.js';
import { cryptoModule } from './crypto.js';
import { fsModule } from './fs.js';
import { pathModule } from './path.js'; // B"H - The Navigator

export const NodeCoreModules = {
    'events': eventsModule,
    'buffer': bufferModule,
    'net': netModule,
    'http': httpModule,
    'crypto': cryptoModule,
    'fs': fsModule,
    'path': pathModule
};
