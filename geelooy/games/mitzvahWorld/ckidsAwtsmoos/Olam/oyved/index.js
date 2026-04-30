
/**
 * B"H
 * @file oyved/index.js
 * THE ANGELIC WORKER (OYVED)
 * 
 * Chapter 1: The Spark in the Dark.
 * This worker manages the 3D reality creation. 
 * We import the Olam faculties directly and catch all falling sparks (errors).
 */

import Olam from '../index.js';
import Utils from '../../utils.js';

console.log('B"H - 👷‍♂️ [OYVED]: Thread consciousness sparked. Waiting for Pawsawch.');

self.OlamInstance = null;
const promiseMap = new Map();

self.onmessage = async (e) => {
    const data = e.data;
    if (!data || typeof data !== 'object') return;

    // 1. THE FIRST WORD (GENESIS COMMAND)
    if (data.type === 'pawsawch' || data.pawsawch) {
        console.log('B"H - 👷‍♂️ [OYVED]: Pawsawch received. Initiating Reality.');
        self.postMessage({ type: 'pawsawch_digested', status: 'Forging' });

        try {
            // Instantiate the World
            const olam = new Olam();
            self.OlamInstance = olam;

            const payload = data.payload || data.pawsawch;
            
            // Set fundamental engine parameters
            if (payload.systemInfo && payload.systemInfo.set) {
                Object.assign(olam, payload.systemInfo.set);
            }

            console.log('B"H - 👷‍♂️ [OYVED]: Initializing Olam Core...');
            await olam.init();

            // ----------------------------------------------------------------
            // ESTABLISH COMMUNICATION BRIDGES
            // ----------------------------------------------------------------
            olam.on("hide loading screen", () => {
                self.postMessage({ type: "hideLoadingScreen" });
            });

            olam.on("increased percentage", (info = {}) => {
                self.postMessage({ type: "increasedOlamLoading", payload: info });
            });

            // HTML Event bridges (Handling the promises requested by Main Thread)
            olam.on("htmlCreate", async (info={}) => {
                const req = Utils.stringifyFunctions(info);
                req.id = Math.random().toString();
                const p = new Promise(r => promiseMap.set(req.id, r));
                self.postMessage({ htmlCreate: req });
                return await p;
            });
            
            olam.on("htmlAction", async (info={}) => {
                info.id = Math.random().toString();
                const req = Utils.stringifyFunctions(info);
                const p = new Promise(r => promiseMap.set(info.id, r));
                self.postMessage({ htmlAction: req });
                return await p;
            });

            olam.on("htmlDelete", async (info={}) => {
                info.id = Math.random().toString();
                const p = new Promise(r => promiseMap.set(info.id, r));
                self.postMessage({ htmlDelete: info });
                return await p;
            });
            
            olam.on("htmlActions", async (ar) => {
                const id = Math.random().toString();
                const p = new Promise(r => promiseMap.set(id, r));
                self.postMessage({ htmlActions: { ar: ar.map(Utils.stringifyFunctions), id } });
                return await p;
            });

            olam.on("send ui event", async (shaym, ob) => {
                const id = Math.random().toString();
                const p = new Promise(r => promiseMap.set(id, r));
                self.postMessage({ sendUiEvent: { shaym, ob, id } });
                return await p;
            });

            // ----------------------------------------------------------------
            // WORLD POPULATION (THE SIX DAYS)
            // ----------------------------------------------------------------
            const worldData = payload.userInfo || payload;
            const nivrayimData = worldData.nivrayim || {};
            
            console.log('B"H - 👷‍♂️ [OYVED]: Commencing loadNivrayim pipeline...', Object.keys(nivrayimData));
            
            const loadStart = performance.now();
            const result = await olam.loadNivrayim(nivrayimData);
            const loadTime = (performance.now() - loadStart).toFixed(2);
            
            console.log(`B"H - 👷‍♂️ [OYVED]: loadNivrayim completed successfully. Manifested ${result.length} souls in ${loadTime}ms.`);

            // Seal the process and notify the UI
            self.postMessage({ type: 'loadedWorld', payload: { status: 'Complete' } });
            self.postMessage({ type: 'game started', payload: true });

        } catch (err) {
            console.error('B"H - 🚨 [OYVED]: Fatal Crash during creation:', err);
            self.postMessage({ type: 'ERROR', details: err.stack || err.toString() });
        }
        return;
    }

    // 2. DISPATCHING CONTINUOUS ENGINE EVENTS (Keypresses, Mouse, Physics updates)
    if (self.OlamInstance) {
        const olam = self.OlamInstance;
        const keys = Object.keys(data);
        
        for (let key of keys) {
            const payload = data[key];

            if (key === 'takeInCanvas') {
                console.log('B"H - 👷‍♂️ [OYVED]: Receiving Canvas Vessel.');
                olam.takeInCanvas(payload.canvas, payload.devicePixelRatio);
                
                if (typeof olam.setSize === 'function') {
                    await olam.setSize(payload.width, payload.height);
                }
                
                console.log('B"H - 👷‍♂️ [OYVED]: Igniting Heartbeat (heesHawvoos).');
                if (typeof olam.heesHawvoos === 'function') {
                    olam.heesHawvoos(); 
                }
            }
            else if (key === 'keydown') olam.ayshPeula('keydown', payload);
            else if (key === 'keyup') olam.ayshPeula('keyup', payload);
            else if (key === 'mousedown') olam.ayshPeula('mousedown', payload);
            else if (key === 'mouseup') olam.ayshPeula('mouseup', payload);
            else if (key === 'mousemove') olam.ayshPeula('mousemove', payload);
            else if (key === 'wheel') olam.ayshPeula('wheel', payload);
            else if (key === 'resize') {
                if (typeof olam.setSize === 'function') await olam.setSize(payload.width, payload.height);
                olam.ayshPeula('resize', payload);
            }
            else if (key === 'cameraDrag') {
                if (olam.ayin && typeof olam.ayin.rotateAroundTarget === 'function') {
                    olam.ayin.rotateAroundTarget(payload.dx, payload.dy);
                }
            }
            else if (key === 'olamPeula') {
                for(let p in payload) {
                    olam.ayshPeula(p, payload[p]);
                }
            }
            // Resolve returning UI Promises
            else if (['htmlCreated', 'htmlActioned', 'htmlDeleted', 'htmlActionsed', 'uiEvented', 'htmlGot'].includes(key)) {
                if (payload && payload.id && promiseMap.has(payload.id)) {
                    promiseMap.get(payload.id)(payload);
                    promiseMap.delete(payload.id);
                }
            }
        }
    }
};

// Broadcast readiness instantly to start the chain
self.postMessage({ type: 'vessel_ready' });
