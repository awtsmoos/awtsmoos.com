// B"H
/**
 * @module TooltipSkin
 * @description
 * 🌌 THE VISION OF POTENTIAL 🌌
 * WoW-inspired rich tooltips for the Treasury.
 */

export default /*css*/`
    .awtsmoos-tooltip {
        background: rgba(10, 5, 25, 0.95);
        border: 2px solid rgba(0, 255, 237, 0.4);
        border-top-color: rgba(0, 255, 237, 0.8);
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 255, 237, 0.1);
        backdrop-filter: blur(15px);
        font-family: 'Outfit', sans-serif;
        min-width: 220px;
        max-width: 320px;
        pointer-events: none;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .tooltip-header {
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 8px;
    }

    .tooltip-icon {
        font-size: 28px;
    }

    .tooltip-name {
        font-size: 20px;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .tooltip-type {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #00ffed;
    }

    .tooltip-description {
        font-size: 14px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.8);
        font-style: italic;
    }

    .tooltip-value {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #ffde40;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .awtsmoos-tooltip.hidden {
        display: none !important;
        opacity: 0;
    }
`;
