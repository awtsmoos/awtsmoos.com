
// B"H
/**
 * @file TabGatekeeper.js
 * @brief The Guard at the Portal of Perception.
 */
import { RealityVerifier } from '../../../core/validation/RealityVerifier.js';
import { UI } from '../../../ui.js';

export const TabGatekeeper = {
    /**
     * @async
     * @function check
     * @description Verifies the existence of the vessel.
     */
    async check(tab) {
        const isReal = await RealityVerifier.verify(tab.item);
        if (!isReal && tab.item.type !== 'vibe-manager' && !tab.isPreview) {
            UI.showToast(`B"H - Vessel dissolved: ${tab.item.name}`, "warning");
            return false;
        }
        return true;
    }
};
