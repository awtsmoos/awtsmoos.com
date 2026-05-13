
/**
 * B"H
 * @file oyved/index.js
 * THE ANGELIC WORKER COMMANDER (KETER OF OYVED)
 * 
 * Chapter 1: The Sparks of Atzilut
 * By shattering this colossal file into deep sub-modules, we emulate the 
 * shattering of the vessels, resulting in a perfectly ordered Tikun (Rectification).
 * 
 * The worker sits inside total Ayin (Nothingness), calls down its existence 
 * dynamically, processes the massive "pawsawch" decree to build the world, 
 * and routes every ongoing heartbeat seamlessly through its pure dictionaries.
 */

import { OlamDynamicBoot } from './core/boot/OlamDynamicBoot.js';
import { OyvedMessageInterpreter } from './core/interpreter/OyvedMessageInterpreter.js';

// The Ledger of Memories and Actions
const promiseMap = new Map();
let SystemCore = { OlamClass: null, UtilsClass: null, isReady: false };
let ActiveOlamInstance = null;

// Ignite the boot sequence entirely shielded
const VesseBootPromise = OlamDynamicBoot.invokeAngelicVessels().then(res => {
    SystemCore = res;
    return res.isReady;
});

/**
 * Universal reception listener. The ear turned to the heavens.
 */
self.onmessage = async (e) => {
    const isVesselsSound = await VesseBootPromise;
    const responseType = await OyvedMessageInterpreter.handleMessage(
        e.data, 
        isVesselsSound, 
        SystemCore, 
        promiseMap
    );

    // If it's a completely new instance returned by Pawsawch!
    if (responseType !== null && typeof responseType === 'object') {
        ActiveOlamInstance = responseType;
    }
    // If it wasn't the creation sequence, it's an ongoing signal
    else if (responseType === 'CONTINUOUS') {
        OyvedMessageInterpreter.handleOngoing(ActiveOlamInstance, e.data, promiseMap);
    }
};
