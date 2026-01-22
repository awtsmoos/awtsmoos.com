// B"H
/**
 * loadNivrayim.js - The Forge of Manifestation.
 * Refined for ATOMIC CREATION to ensure world stability and prevent partial states.
 * Now with EXTREME LOGGING to track the descent of every spark.
 */
import Utils from '../../utils.js'
import ClassMap from '../../registry/classMap.js';

export default class {
    /**
     * addObject - Atomic creation of a single Nivra.
     */
    async addObject(type, options) {
        console.log(`B"H - Summoning a single '${type}' from the infinite...`);
        const path = ClassMap[type];
        if (!path) throw new Error(`B"H: Entity type '${type}' is not registered.`);

        let Module;
        try {
            Module = await import(path);
        } catch(e) {
            throw new Error(`B"H: Could not draw down logic for ${type} at ${path}.`);
        }

        const EntityClass = Module.default;
        const nivra = new EntityClass(options, this);
        
        // Initiate the vessel's existence
        if (nivra.heescheel) {
            console.log(`B"H - Igniting heescheel for ${nivra.name}...`);
            await nivra.heescheel(this, {});
        }
        
        if (nivra.ready) {
            console.log(`B"H - Entity ${nivra.name} is ready for manifestation.`);
            await nivra.ready();
        }
        if (nivra.afterBriyah) await nivra.afterBriyah();
        
        return nivra;
    }

    /**
     * loadNivrayim - Atomic World Forge.
     * Staging entities in a private Ayin (Nothingness) and only breathing life
     * once the entire collective is proven stable.
     */
    async loadNivrayim(blueprint) {
        console.group("B\"H - Atomic World Forge Initiated");
        const stagedVessels = [];
        const entries = Object.entries(blueprint);

        try {
            // PHASE 1: ATOMIC INSTANTIATION - Summoning the souls
            for (const [type, instances] of entries) {
                const path = ClassMap[type];
                if (!path) {
                    console.warn(`B"H - Skipping unknown type: ${type}`);
                    continue;
                }

                console.log(`B"H - Accessing logic for type: ${type} at ${path}`);
                const Module = await import(path);
                const EntityClass = Module.default;

                const instanceArray = Array.isArray(instances) ? instances : Object.entries(instances);
                
                for (const entry of instanceArray) {
                    let name, options;
                    if (Array.isArray(instances)) { options = entry; name = options.name; } 
                    else { name = entry[0]; options = entry[1]; }

                    if (type === "Chossid" && this.playerSettings) {
                        options.inventory = this.playerSettings.inventory;
                    }

                    try {
                        const evaledOptions = Utils.evalStringifiedFunctions(options);
                        console.log(`B"H - Forging Soul: ${name || type}`);
                        const nivra = new EntityClass({ name, ...evaledOptions }, this);
                        if (nivra) stagedVessels.push(nivra);
                    } catch (e) {
                        console.error(`B"H: Failed to forge soul for '${name}'.`, e);
                        if (options.vital) throw e; 
                    }
                }
            }

            const total = stagedVessels.length;
            if (total === 0) {
                console.warn("B\"H - The Blueprint is empty. No souls to manifest.");
                console.groupEnd();
                return [];
            }

            console.log(`B"H - Successfully summoned ${total} souls. Beginning physical manifestation (Heescheel)...`);

            // PHASE 2: ATOMIC PREPARATION (Heescheel) - Drawing down assets
            for (let i = 0; i < total; i++) {
                const nivra = stagedVessels[i];
                const pct = Math.floor(((i + 1) / total) * 100);
                
                console.log(`B"H - Manifesting Matter [${pct}%]: ${nivra.name || nivra.type}`);
                this.ayshPeula("increase loading percentage", {
                    amount: pct, reset: true,
                    action: "Forging Matter...",
                    subAction: `Refining Essence: ${nivra.name || nivra.type}`
                });

                // B"H: Recursive Yielding - prevents thread lock
                await new Promise(r => setTimeout(r, 0));

                if (nivra.heescheel) {
                    await nivra.heescheel(this, { nivrayimMade: stagedVessels });
                }
            }

            // PHASE 3: LOGICAL SYNC (MadeAll / Placeholders)
            console.log("B\"H - Synchronizing Hierarchies and Placeholders...");
            for (const nivra of stagedVessels) {
                if (nivra.madeAll) await nivra.madeAll(this);
                await this.doPlaceholderAndEntityLogic(nivra);
            }

            // PHASE 4: ENLIGHTENMENT (Ready / Scene Projection)
            this.ayshPeula("increase loading percentage", {
                amount: 100, reset: true,
                action: "Breathing Life...",
                subAction: "Igniting the Souls"
            });

            console.log("B\"H - Breathing life into all created things (Ready phase)...");
            for (const nivra of stagedVessels) {
                if (nivra.ready) await nivra.ready();
                if (nivra.afterBriyah) await nivra.afterBriyah();
            }

            // Final scene revealing
            if(!this.enlightened) {
                console.log("B\"H - Illuminating the Olam with Divine Light...");
                this.ohr();
            }
            
            console.log("B\"H - World Forge Successful. The universe is manifest.");
            console.groupEnd();
            return stagedVessels;

        } catch (error) {
            console.error("B\"H - ATOMIC FORGE FAILURE - THE TZIMTZUM SHATTERED:", error);
            
            // Cleanup staged orphans
            stagedVessels.forEach(v => { if(v.sealayk) v.sealayk(); });
            
            this.ayshPeula("increase loading percentage", {
                error: {
                    title: "Forge Shattered",
                    message: "An imperfection in the blueprint prevented manifestation.",
                    details: error.message
                }
            });
            console.groupEnd();
            throw error; 
        }
    }
}
