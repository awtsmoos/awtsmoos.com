
/**
 * B"H
 * Olam Lifecycle Orchestrator
 * "And they were finished, the heavens and the earth..."
 */

export default {
    /**
     * @method heescheelPhase1
     * @description
     * Chapter 55: The Forging of the Vessels.
     * Updated with hyper-specific logging to track the Chossid's birth.
     */
    async heescheelPhase1(nivrayimBlueprints, progressCallback) {
        const total = nivrayimBlueprints.length;
        const results = [];

        // B"H: silent


        for (let i = 0; i < total; i++) {
            const blueprint = nivrayimBlueprints[i];
            const entityType = blueprint.type;
            const details = blueprint.details;
            const name = details.name || entityType;

            // B"H: silent


            try {
                // 1. Instantiation
                const startTime = performance.now();
                
                // Assuming this.createEntity is where the Class is initialized
                const entity = this.createEntity(entityType, details);
                if (!entity) {
                    console.error(`B"H - 🚨 [HEESCHEEL]: Failed to create soul for [${name}]!`);
                    continue;
                }

                // B"H: silent


                // 2. Physical Loading / Generation
                // Most hangs happen inside THIS await call.
                const p = entity.heescheel ? entity.heescheel() : Promise.resolve();
                
                // Timeout safeguard: If an entity takes > 30s, warn.
                const timeout = setTimeout(() => {
                    console.error(`B"H - 🕒 [HEESCHEEL_STALL]: Entity [${name}] has been loading for 30s. Thread likely hung.`);
                }, 30000);

                await p;
                clearTimeout(timeout);

                const duration = performance.now() - startTime;
                // B"H: silent


                results.push(entity);
                
                if (progressCallback) {
                    const prog = 50 + ((i + 1) / total) * 50;
                    progressCallback(prog, `Manifested: ${name}`);
                }

            } catch (err) {
                console.error(`B"H - 🚨 [HEESCHEEL]: Disaster struck while building [${name}]:`, err);
            }
        }

        return results;
    }
};
