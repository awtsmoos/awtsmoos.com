
/**
 * B"H
 * @module MatrixStyle
 * @description
 * 🌌 THE PALACE OF THE KING — EXTREME MAIN MENU REDESIGN 🌌
 * 
 * "And Solomon built the Temple of G-d." (Melachim I 6:14)
 * The menu is no longer a simple void. It is the Beis HaMikdash of interfaces.
 * We introduce living, breathing nebula gradients, glassmorphism panels,
 * and a deep cosmic void that feels monumental and unforgettable.
 */

export default /*css*/`
    .menu {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 100;
        box-sizing: border-box;

        /* THE LIVING NEBULA: Deep cosmic gradients */
        background-color: #020008;
        background-image:
            radial-gradient(ellipse 120% 80% at 15% 25%, #1a0540 0%, transparent 65%),
            radial-gradient(ellipse 100% 70% at 85% 75%, #001a3a 0%, transparent 60%),
            radial-gradient(ellipse 80% 90% at 50% 110%, #0d1f00 0%, transparent 55%),
            radial-gradient(ellipse 60% 60% at 72% 18%, #200030 0%, transparent 50%);
        background-size: 200% 200%, 180% 180%, 160% 160%, 140% 140%;
        animation: nebulaBreath 25s ease-in-out infinite;
        
        perspective: 1000px;
    }

    /* THE STAR FIELD */
    .menu::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 30% 80%, rgba(255,240,200,0.9) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 40%, rgba(200,220,255,0.7) 0%, transparent 100%),
            radial-gradient(2px 2px at 90% 10%, rgba(255,230,180,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 100%);
        pointer-events: none;
        z-index: 0;
    }

    @keyframes nebulaBreath {
        0%   { background-position: 0% 0%, 100% 100%, 50% 50%; }
        33%  { background-position: 100% 50%, 0% 50%, 100% 0%; }
        66%  { background-position: 50% 100%, 50% 0%, 0% 100%; }
        100% { background-position: 0% 0%, 100% 100%, 50% 50%; }
    }

    /* The Drifting Sparks of the Void */
    .rectangle {
        position: absolute;
        background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,160,0,0.2) 70%, transparent 100%);
        box-shadow: 0 0 10px rgba(255,215,0,0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        animation: sparkRise 15s ease-in infinite;
    }

    @keyframes sparkRise {
        0%   { transform: translateY(110vh) scale(0.5); opacity: 0; }
        10%  { opacity: 0.8; }
        90%  { opacity: 0.8; }
        100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
    }

    /* The login header - The Gate of Entry */
    .loginHeader {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        pointer-events: auto !important;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* THE CENTRAL HOLY ARK (Glassmorphism Panel) */
    .info {
        position: relative;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        width: min(92vw, 650px);
        margin: auto;
        
        background: linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0) 30%), rgba(6, 4, 28, 0.75);
        border: 1px solid rgba(255, 215, 0, 0.2);
        border-top: 1px solid rgba(255, 215, 0, 0.4);
        border-radius: 25px;
        padding: 60px 50px 50px;

        box-shadow:
            0 20px 80px rgba(0,0,0,0.9),
            0 4px 30px rgba(255,215,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.5);

        backdrop-filter: blur(25px) saturate(1.5);
        -webkit-backdrop-filter: blur(25px) saturate(1.5);

        animation: arkEntrance 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes arkEntrance {
        from { opacity: 0; transform: translateY(40px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (max-width: 600px) {
        .info {
            padding: 40px 20px 30px;
            border-radius: 15px;
            width: 95vw;
        }
        .loginHeader {
            top: 15px;
            right: 15px;
        }
    }
`;
