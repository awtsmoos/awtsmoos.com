
/**
 * B"H
 * @module IntenseBackgrounds
 * @description 
 * Deep, mind-bending keyframes representing the sheer power of the Klipot.
 * Applied to the underlying 'awtsmoos-battle-bg' which is naturally scaled to 200% width and height,
 * so when it rotates and shifts, the edges of the void never bleed into the holy UI!
 */
export const IntenseBackgrounds = `
    .bg-void-anim {
        background: radial-gradient(circle at 50% 50%, #1a0033 0%, #000 100%), 
                    repeating-conic-gradient(from 0deg, #111 0deg 10deg, #000 10deg 20deg);
        background-size: 100% 100%;
        animation: spinVoid 20s linear infinite, throbVoid 4s ease-in-out infinite alternate;
    }

    @keyframes spinVoid {
        from { transform: scale(1) rotate(0deg); }
        to { transform: scale(1) rotate(360deg); }
    }

    @keyframes throbVoid {
        from { filter: brightness(0.8) contrast(1.2); }
        to { filter: brightness(1.2) contrast(1.5) hue-rotate(20deg); }
    }

    .bg-stone-anim {
        background: radial-gradient(circle at center, #3e2723 0%, #000 80%), 
                    repeating-linear-gradient(45deg, #1a100c 0, #1a100c 20px, transparent 20px, transparent 40px);
        animation: panStone 15s linear infinite;
        background-size: 200px 200px;
    }

    @keyframes panStone {
        from { background-position: 0 0; }
        to { background-position: 200px 200px; }
    }

    .bg-wind-anim {
        background: radial-gradient(circle at center, #006064 0%, #000 100%), 
                    repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(0, 229, 255, 0.1) 40px, rgba(0, 229, 255, 0.1) 80px);
        background-size: 100% 100%;
        animation: spiralWind 8s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
    }

    @keyframes spiralWind {
        from { transform: scale(1); filter: hue-rotate(0deg); }
        to { transform: scale(1.5); filter: hue-rotate(90deg); }
    }

    .bg-fire-anim {
        background: radial-gradient(ellipse at center, #b71c1c 0%, #000 80%);
        animation: flickerFire 2s ease-in-out infinite alternate;
    }

    @keyframes flickerFire {
        0% { transform: scale(1); filter: brightness(0.8); }
        100% { transform: scale(1.1); filter: brightness(1.5) contrast(1.3); }
    }

    .bg-logic-anim {
        background: radial-gradient(ellipse at center, #2b00ff 0%, #000 80%), 
                    linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent);
        background-size: 100px 100px;
        animation: slideLogic 5s linear infinite;
    }

    @keyframes slideLogic {
        from { background-position: 0 0; }
        to { background-position: 100px 100px; }
    }
`;
