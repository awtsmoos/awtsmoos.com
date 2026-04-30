
// B"H
/**
 * @class VeilController
 * @description
 * * Chapter 30: The Dissolving of the Clouds
 * The loading screen is a cloud, a 'Machshak' (darkness) that conceals the light.
 * It protects the observer from the sight of unformed vessels (meshes) and 
 * incomplete dimensions.
 * * But once the Seder Hishtalshelus is complete, and the 'rendered first time'
 * decree is uttered, the cloud must vanish!
 * * This class performs the absolute removal of the loading veil from the DOM,
 * ensuring the soul is not trapped in an eternal wait.
 */
export default class VeilController {
    /**
     * @constructor
     * @param {Object} uiInstance - The master UI manifestor.
     */
    constructor(uiInstance) {
        this.ui = uiInstance;
    }

    /**
     * @method liftVeil
     * @description Forcefully dismantles the loading screen element.
     * Searches for the Shaym 'loading' and destroys its physical presence.
     */
    liftVeil() {
        console.log('B"H - ⚡ VeilController: The Word has been spoken. Lifting the Veil.');
        
        // 1. Seek the vessel by its Holy Name
        const loadingScreen = document.querySelector('[shaym="loading"]');
        
        if (loadingScreen) {
            // Apply a smooth transition back into the Infinite
            loadingScreen.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), filter 1s';
            loadingScreen.style.opacity = '0';
            loadingScreen.style.filter = 'blur(20px)';
            loadingScreen.style.pointerEvents = 'none';

            // 2. Erase the physical trace after the transition
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                    console.log('B"H - ✨ Loading screen dissolved. Existence revealed.');
                }
            }, 1600);
        } else {
            console.warn('B"H - ❓ The Veil was already absent from this dimension.');
        }

        // 3. Ensure the main menu also departs
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }
}
