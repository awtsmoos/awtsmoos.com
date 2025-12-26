/**
 * B"H
 * Olam Worker Entry Point - Absolute Safety Edition
 * NO STATIC IMPORTS ALLOWED HERE.
 */

// 1. Trap global errors immediately
self.onerror = function(msg, url, lineNo, columnNo, error) {
    var errorInfo = {
        message: msg,
        filename: url,
        lineno: lineNo,
        colno: columnNo,
        error: error ? error.toString() : "N/A",
        stack: error ? error.stack : "No stack trace available",
        type: "Global Worker Error"
    };
    
    // Log to console in worker as well
    console.error("B\"H WORKER ERROR CAUGHT:", errorInfo);
    
    try {
        self.postMessage({ error: errorInfo });
    } catch(e) {
        console.error("B\"H - Failed to report error to main thread:", e);
    }
    return false; 
};

// 2. Trap unhandled promises
self.addEventListener('unhandledrejection', function(event) {
    console.error("B\"H WORKER UNHANDLED REJECTION:", event.reason);
    self.postMessage({
        error: {
            message: "Unhandled Promise Rejection: " + event.reason,
            stack: event.reason ? event.reason.stack : null,
            type: "Promise Rejection"
        }
    });
});

// 3. Async Bootstrap
(async function bootstrapWorker() {
    console.log("B\"H - Worker Bootstrap Starting... Diagnostic Mode Enabled.");

    var Utils, THREE, OlamClass;

    // A. Load Core Dependencies Individually
    try {
        console.log("B\"H - 1. Loading Utils.js...");
        // Path: ../../utils.js (relative to ckidsAwtsmoos/Olam/oyved/index.js)
        var utilsModule = await import("../../utils.js").catch(e => {
            throw new Error("Failed to load Utils.js: " + e.message);
        });
        Utils = utilsModule.default;
        console.log("B\"H - Utils.js Loaded.");

        console.log("B\"H - 2. Loading THREE.js...");
        var threeModule = await import('/games/scripts/build/three.module.js').catch(e => {
            throw new Error("Failed to load THREE.js: " + e.message);
        });
        THREE = threeModule;
        self.THREE = THREE; 
        console.log("B\"H - THREE.js Loaded.");

        // B"H - 3. Diagnostic Load of Olam Dependencies
        // These paths must be relative to THIS file (ckidsAwtsmoos/Olam/oyved/index.js)
        console.log("B\"H - 3a. Checking Olam Dependencies...");
        
        try {
            console.log("B\"H - 3a.1. Checking ../../chayim/nivra.js...");
            await import("../../chayim/nivra.js");
            console.log("B\"H - 3a.1. OK.");
        } catch(e) { throw new Error("Failed Olam Dependency: nivra.js. " + e.message); }

        try {
             console.log("B\"H - 3a.2. Checking ../camera/index.js...");
             await import("../camera/index.js");
             console.log("B\"H - 3a.2. OK.");
        } catch(e) { throw new Error("Failed Olam Dependency: camera/index.js. " + e.message); }

        try {
             console.log("B\"H - 3a.3. Checking ../../systems/UserProgressManager.js...");
             await import("../../systems/UserProgressManager.js");
             console.log("B\"H - 3a.3. OK.");
        } catch(e) { throw new Error("Failed Olam Dependency: UserProgressManager.js. " + e.message); }

        try {
             console.log("B\"H - 3a.4. Checking ../methods/environment.js...");
             await import("../methods/environment.js");
             console.log("B\"H - 3a.4. OK.");
        } catch(e) { throw new Error("Failed Olam Dependency: methods/environment.js. " + e.message); }
        
        try {
             console.log("B\"H - 3a.5. Checking ../methods/properties.js...");
             await import("../methods/properties.js");
             console.log("B\"H - 3a.5. OK.");
        } catch(e) { throw new Error("Failed Olam Dependency: methods/properties.js. " + e.message); }

        try {
             console.log("B\"H - 3a.6. Checking ../materials/Grass.js...");
             await import("../materials/Grass.js");
             console.log("B\"H - 3a.6. OK.");
        } catch(e) { throw new Error("Failed Olam Dependency: materials/Grass.js. " + e.message); }


        console.log("B\"H - 3. Loading Olam Core (../index.js)...");
        // Load Olam Core
        var olamModule = await import("../index.js").catch(e => {
            console.error("B\"H - Olam Core Load Error Detail:", e);
            throw new Error(`Failed to load Olam Core (../index.js). Likely Syntax Error in imports. Details: ${e.message}`);
        });
        OlamClass = olamModule.default;
        self.Olam = OlamClass;

        console.log("B\"H - Core Dependencies Loaded Successfully.");

    } catch (e) {
        console.trace("B\"H - Bootstrap Import Error:", e);
        self.postMessage({
            error: {
                message: "Worker Bootstrap Failed: " + e.message,
                stack: e.stack,
                type: "Import Error"
            }
        });
        return; 
    }

    // B. Initialize Logic
    try {
        console.log("B\"H - 4. Starting Worker Logic...");
        await startWorkerLogic(OlamClass, Utils);
        console.log("B\"H - 4. Worker Logic Started.");
    } catch (e) {
         self.postMessage({
            error: {
                message: "Worker Initialization Logic Failed: " + e.message,
                stack: e.stack
            }
        });
    }

})();

async function startWorkerLogic(OlamClass, Utils) {
    var promiseMap = new Map();

    function registerPromise(id) {
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }

    var me = {
        olam: null,
        promiseMap,
        registerPromise
    };

    // C. Load Methods Dynamically
    var tawfkeedeem = {};
    var methodModules = {
        inventory: "./methods/inventory.js",
        world: "./methods/world.js",
        ui: "./methods/ui.js",
        input: "./methods/input.js",
        canvas: "./methods/canvas.js"
    };

    for (var name in methodModules) {
        var path = methodModules[name];
        try {
            var mod = await import(path);
            if (mod.default) {
                if (name === 'world') {
                    Object.assign(tawfkeedeem, mod.default(me, OlamClass));
                } else {
                    Object.assign(tawfkeedeem, mod.default(me));
                }
            }
        } catch (e) {
            console.error(`B"H - Failed to load module '${name}' from ${path}:`, e);
            self.postMessage({
                error: {
                    message: `Failed to load worker module '${name}': ${e.message}`,
                    filename: path,
                    stack: e.stack,
                    type: "Module Load Error"
                }
            });
        }
    }

    // D. Setup Message Listener
    addEventListener("message", async e => {
        var dayuh = e.data;
        if(typeof(dayuh) == "object") {
            try {
                for(var q of Object.keys(dayuh)) {
                    var tawfeek = tawfkeedeem[q];
                    
                    if(typeof(tawfeek) == "function") {
                        var result = await tawfeek(dayuh[q]);
                        
                        var tawch;
                        if(!result) result = {};
                        if(result.tawchlees) {
                            tawch = result.tawchlees
                        };
                        
                        var shouldITransfer = !!result.transfer;
                        postMessage({
                            [q]: tawch
                        }, shouldITransfer ? [tawch] : undefined)
                    }
                }
            } catch(err) {
                console.error("B\"H - Runtime Error processing message:", err);
                self.postMessage({
                    error: {
                        message: "Runtime Error: " + err.message,
                        stack: err.stack,
                        command: Object.keys(dayuh)[0]
                    }
                });
            }
        }
    });

    console.log("B\"H - Olam Worker Fully Initialized and Listening.");
    postMessage({ pawsawch: true });
}
