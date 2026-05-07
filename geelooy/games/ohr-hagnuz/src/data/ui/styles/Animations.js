
/**
 * B"H
 * @module Animations
 */
export const Animations = `
    @keyframes divinePulse {
        0% { text-shadow: 0 0 20px #00e5ff; transform: scale(1); }
        50% { text-shadow: 0 0 60px #84ffff, 0 0 120px #00e5ff; transform: scale(1.05) translateY(-10px); }
        100% { text-shadow: 0 0 20px #00e5ff; transform: scale(1); }
    }

    @keyframes klipahWobble {
        0% { transform: scale(1) rotate(-3deg); filter: contrast(1); }
        50% { transform: scale(1.1) rotate(3deg) translateY(-10px); filter: contrast(1.5) hue-rotate(45deg); }
        100% { transform: scale(1) rotate(-3deg); filter: contrast(1); }
    }

    /* THE GREAT ASCENDING STRIKE (From Bottom-Right to Top-Left) */
    .anim-hero-attack {
        animation: heroLunge 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
    }
    @keyframes heroLunge {
        0% { transform: translate(0, 0) scale(1); }
        30% { transform: translate(30px, 30px) scale(0.9); } 
        60% { transform: translate(-300px, -200px) scale(1.8); text-shadow: 0 0 100px #fff; } 
        100% { transform: translate(0, 0) scale(1); }
    }

    /* THE DESCENDING VOID STRIKE (From Top-Left to Bottom-Right) */
    .anim-enemy-attack {
        animation: enemyLunge 0.5s ease-in forwards !important;
    }
    @keyframes enemyLunge {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(300px, 200px) scale(2); filter: brightness(0.2) invert(1); }
        100% { transform: translate(0, 0) scale(1); }
    }

    .anim-screen-shake {
        animation: shakeHard 0.4s both;
    }
    @keyframes shakeHard {
        0%, 100% { transform: translate(0, 0); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-10px, 10px); }
        20%, 40%, 60%, 80% { transform: translate(10px, -10px); }
    }

    .flash-overlay {
        position: absolute; inset: 0; background: #fff; z-index: 1000; opacity: 0; pointer-events: none;
    }
    .anim-flash {
        animation: flashEffect 0.6s ease-out;
    }
    @keyframes flashEffect {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }

    .slash-effect {
        position: absolute; inset: 0; z-index: 900; opacity: 0; pointer-events: none;
        background: linear-gradient(135deg, transparent 48%, #fff 49%, #00e5ff 50%, #fff 51%, transparent 52%);
        background-size: 200% 200%; background-position: 100% 100%;
    }
    .anim-slash {
        animation: slashAnim 0.3s ease-in-out;
    }
    @keyframes slashAnim {
        0% { opacity: 1; background-position: 100% 100%; }
        100% { opacity: 0; background-position: 0% 0%; }
    }

    .anim-redeem-spark {
        animation: redeemEffect 2s forwards !important;
    }
    @keyframes redeemEffect {
        0% { transform: scale(1); filter: brightness(1); opacity: 1; }
        30% { transform: scale(0.5) rotate(180deg); filter: brightness(3) sepia(1) hue-rotate(50deg); opacity: 0.8; }
        60% { transform: scale(0.1) rotate(360deg) translate(500px, 500px); opacity: 0.5; }
        100% { transform: scale(0); opacity: 0; }
    }

    .anim-vanquish {
        animation: vanquishEffect 1.5s forwards !important;
    }
    @keyframes vanquishEffect {
        0% { transform: scale(1); filter: brightness(1); opacity: 1; }
        40% { transform: scale(1.5) rotate(15deg); filter: brightness(2) blur(5px) hue-rotate(90deg); opacity: 0.8; }
        100% { transform: scale(0) rotate(90deg); filter: brightness(0) blur(20px); opacity: 0; }
    }

    .anim-ascension {
        animation: ascensionEffect 2.5s forwards !important;
    }
    @keyframes ascensionEffect {
        0% { text-shadow: 0 0 10px #ffd54f; transform: scale(1); }
        50% { text-shadow: 0 0 150px #fff, 0 0 80px #ffd54f, 0 0 40px #ff9100; transform: scale(1.3) translateY(-30px); color: #fff; }
        100% { text-shadow: 0 0 30px #00e5ff; transform: scale(1); color: rgba(0, 229, 255, 0.95); }
    }
`;
