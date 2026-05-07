
/**
 * B"H
 * @module BattleArena
 * @chapter The Architecture of Confrontation
 * @description
 * Out of the void (Ayin), the arena takes shape.
 * The Tzaddik anchors the bottom right, gathering the sparks of Malchut.
 * The Klipah looms in the top left, the root of Din (Severity).
 */
export const BattleArena = `
    .awtsmoos-battle-shell {
        background: #000;
        animation: slideUpFade 0.5s ease-out forwards;
        position: relative; overflow: hidden;
    }

    .battle-floor-grid {
        position: absolute; bottom: -30%; left: -50%; width: 200%; height: 100%;
        background-image: linear-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.15) 2px, transparent 2px);
        background-size: 100px 100px;
        transform: perspective(600px) rotateX(75deg);
        animation: gridStep 2s linear infinite;
        z-index: 1; pointer-events: none;
        -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 70%);
    }

    @keyframes gridStep {
        from { background-position: 0 0; }
        to { background-position: 0 100px; }
    }

    /* THE TZADDIK: Positioned Bottom-Right */
    .battle-sprite-tzaddik {
        position: absolute; 
        bottom: 5%; 
        right: 15%; 
        left: auto;
        font-size: 350px; 
        color: rgba(0, 229, 255, 0.95);
        animation: divinePulse 4s ease-in-out infinite;
        z-index: 500; 
        filter: drop-shadow(0 0 50px rgba(0,229,255,0.7));
        pointer-events: none;
        user-select: none;
        transform-origin: center bottom;
    }

    /* THE KLIPAH: Positioned Top-Left */
    .battle-sprite-klipah {
        position: absolute; 
        top: 15%; 
        left: 15%; 
        right: auto;
        font-size: 200px; 
        color: rgba(213, 0, 249, 0.85);
        animation: klipahWobble 3s ease-in-out infinite;
        z-index: 10; 
        filter: drop-shadow(0 0 20px rgba(213,0,249,0.4));
        pointer-events: none;
        user-select: none;
        transform-origin: center center;
    }

    .battle-hud-panel {
        background: rgba(5, 5, 10, 0.9); border: 2px solid #444; border-radius: 12px;
        box-shadow: 0 0 40px #000; backdrop-filter: blur(10px); z-index: 600;
    }
`;
