
/**
 * @file ButtonStyle.js
 * @description
 * ⚡ THE ACT OF CHOICE (BECHIRAH) ⚡
 * 
 * "Choose life!" (Devarim 30:19)
 * The buttons are the gateways of intention. We have rebuilt them to be 
 * sturdy, beautiful, and perfectly balanced. They pulse with the Light 
 * of the Awtsmoos, featuring sweeping shimmers and deep shadows.
 */

export default /*css*/`
    .awtsmoosBtn,
    .mitzvahBtn {
        font-family: 'Fredoka', sans-serif !important;
        font-size: 1.25rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.1em !important;
        text-transform: uppercase !important;
        padding: 18px 40px !important;
        border-radius: 60px !important;
        border: 2px solid #ffd700 !important; /* The Golden Boundary */
        cursor: pointer;
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 500px;
        margin-bottom: 15px;

        transition:
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.2s ease,
            box-shadow 0.2s ease;

        /* Deep Emerald Jewel Gradient */
        background: linear-gradient(160deg, #1adc6e 0%, #0ea34c 45%, #086b30 100%) !important;
        color: #ffffff !important;
        text-shadow: 0 2px 5px rgba(0,0,0,0.6) !important;

        animation: btnBreath 3s ease-in-out infinite;
    }

    @keyframes btnBreath {
        0%, 100% {
            box-shadow: 0 6px 25px rgba(26, 220, 110, 0.5), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.4);
        }
        50% {
            box-shadow: 0 10px 40px rgba(26, 220, 110, 0.8), 0 0 60px rgba(26, 220, 110, 0.3), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 0 rgba(0,0,0,0.4);
        }
    }

    /* THE SHIMMER SWEEP */
    .awtsmoosBtn::before,
    .mitzvahBtn::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: linear-gradient(
            105deg,
            transparent 0%,
            transparent 30%,
            rgba(255,255,255,0.3) 45%,
            rgba(255,255,255,0.1) 50%,
            transparent 65%,
            transparent 100%
        );
        background-size: 300% 100%;
        background-position: -200% center;
        pointer-events: none;
        animation: btnShimmer 4s linear infinite;
    }

    @keyframes btnShimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
    }

    .awtsmoosBtn:hover,
    .mitzvahBtn:hover {
        transform: translateY(-4px) scale(1.03);
        filter: brightness(1.2);
    }

    .awtsmoosBtn:active,
    .mitzvahBtn:active {
        transform: translateY(2px) scale(0.97);
        filter: brightness(0.9);
        box-shadow: inset 0 4px 10px rgba(0,0,0,0.5) !important;
    }

    /* Secondary Buttons De-emphasis */
    .info > *:nth-child(n+3) .mitzvahBtn {
        background: linear-gradient(160deg, rgba(0, 80, 160, 0.9) 0%, rgba(0, 40, 90, 0.95) 100%) !important;
        border-color: rgba(0, 200, 255, 0.5) !important;
        color: rgba(220,240,255,0.95) !important;
        text-shadow: 0 0 10px rgba(0,200,255,0.4) !important;
        animation: none;
        box-shadow: 0 4px 20px rgba(0, 100, 200, 0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important;
        font-size: 1.05rem !important;
        padding: 15px 35px !important;
    }

    .info > *:nth-child(n+3) .mitzvahBtn:hover {
        filter: brightness(1.2);
        box-shadow: 0 6px 30px rgba(0, 150, 255, 0.6), inset 0 1px 0 rgba(255,255,255,0.2) !important;
    }

    /* SVG Bubble */
    .svgHolder {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 1;
    }
    .svgHolder svg {
        width: 100%; height: 100%;
        opacity: 0.6;
        mix-blend-mode: overlay;
    }

    @media (max-width: 520px) {
        .awtsmoosBtn, .mitzvahBtn {
            padding: 15px 25px !important;
            font-size: 1rem !important;
        }
    }
`;
