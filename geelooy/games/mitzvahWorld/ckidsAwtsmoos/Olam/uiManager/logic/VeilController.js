
// B"H
/**
 * @class VeilController
 * @description
 * 🌌 THE DECREE OF REVELATION (GULGULTA) 🌌
 */
export default class VeilController {
    static lift() {
        // B"H: silent


        const TARGETS =[
            'mitzvahWorldLanding',
            'loading',
            '.loading',
            '.landing-container',
            '[shaym="loading"]',
            '.mainLoadingArea',
            '.kabbalah-vortex'
        ];

        let totalPurified = 0;

        TARGETS.forEach(target => {
            const elements = target.startsWith('.') || target.startsWith('[') ? 
                document.querySelectorAll(target) :[document.getElementById(target)].filter(Boolean);

            elements.forEach(el => {
                if (!el) return;
                totalPurified++;
                // B"H: silent


                el.classList.add("hidden");
                el.style.transition = 'opacity 1s ease-out, filter 1s ease-out, transform 1s cubic-bezier(0.19, 1, 0.22, 1)';
                el.style.opacity = '0';
                el.style.filter = 'blur(50px) brightness(1.5)';
                el.style.transform = 'scale(1.1)';
                el.style.pointerEvents = 'none';

                setTimeout(() => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, 1500);
            });
        });

        // Awaken Interaction Menus (excluding the initial world browser/menus)
        const interactionVessels = document.querySelectorAll('.menuTop, .gameHUD, .awtsmoosAction');
        interactionVessels.forEach(vessel => {
            // B"H: silent

            vessel.classList.remove('offscreen', 'hidden');
            vessel.classList.add('onscreen');
        });
        
        // Hide Start Screens
        const startupScreens = document.querySelectorAll('.menu, .findWorlds, .level-select-container');
        startupScreens.forEach(screen => {
            if (!screen.classList.contains("gameMenu") && !screen.classList.contains("menuTop")) {
                screen.classList.add('hidden', 'offscreen');
                screen.style.display = 'none';
            }
        });

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // B"H: silent

    }
}
