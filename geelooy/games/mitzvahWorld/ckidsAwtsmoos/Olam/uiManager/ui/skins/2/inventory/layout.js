// B"H
/**
 * @module LayoutSkin
 * @description
 * Chapter 9: The old treasury skin bows out of the wardrobe. This file remains
 * only for legacy Otzar containers. It no longer targets #inventoryScreen or
 * the generic wardrobe class, so the dedicated inventory stylesheet can rule
 * its own vessel without being overwritten by ancient global geometry.
 */
export default /*css*/`
    .inventory-container {
        width: 95vw;
        height: 85vh;
        max-width: 1100px;
        max-height: 800px;
        background: linear-gradient(135deg, rgba(10, 10, 30, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
        border: 1px solid rgba(0, 243, 255, 0.3);
        border-radius: 40px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 243, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        pointer-events: auto !important;
    }

    .inventory-header {
        height: 100px;
        padding: 0 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(180deg, rgba(0, 243, 255, 0.05) 0%, transparent 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .close-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(0, 243, 255, 0.5);
        color: var(--otzar-cyan, #00f3ff);
        width: 48px;
        height: 48px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        pointer-events: auto !important;
    }

    .inventory-title {
        color: #fff;
        font-family: 'Outfit', sans-serif;
        font-size: 38px;
        font-weight: 800;
        letter-spacing: 6px;
        text-transform: uppercase;
        background: linear-gradient(to bottom, #fff, var(--otzar-gold, #ffde40));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 10px rgba(255, 222, 64, 0.3));
    }

    .legacy-inventory-body {
        flex: 1;
        display: flex;
        padding: 40px;
        gap: 40px;
        overflow: hidden;
        background: radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.02) 0%, transparent 70%);
    }

    .slots-grid::-webkit-scrollbar { width: 6px; }
    .slots-grid::-webkit-scrollbar-track { background: transparent; }
    .slots-grid::-webkit-scrollbar-thumb { background: rgba(0, 243, 255, 0.2); border-radius: 10px; }
`;
