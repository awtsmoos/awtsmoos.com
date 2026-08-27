
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
     * @description Verifies the existence of the vessel, with virtual bypass.
     */
    async check(tab) {
        if (!tab || !tab.item) return false;

        const virtualTypes = ['vibe-manager', 'browser', 'devtools', 'html-preview-file'];
        const isVirtual = virtualTypes.includes(tab.item.type) || tab.fileType === 'devtools' || tab.isPreview;

        // If it's a virtual interface, the Reality Verifier (which checks disk) does not apply.
        if (isVirtual) {
            return true;
        }

        const isReal = await RealityVerifier.verify(tab.item);
        if (!isReal) {
            UI.showToast(`B"H - Vessel dissolved: ${tab.item.name}`, "warning");
            return false;
        }
        return true;
    }
};
