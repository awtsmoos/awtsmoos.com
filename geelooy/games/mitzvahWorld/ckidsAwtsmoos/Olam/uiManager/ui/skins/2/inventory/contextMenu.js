
/**
 * B"H
 * @module ContextMenuSkin
 * @description
 * THE DECREES OF INTERACTION
 * 
 * This module defines the aesthetic of the popup context menu.
 */
export default /*css*/`
    .awtsmoosContextMenu {
        position: fixed;
        width: 260px;
        background: rgba(10, 10, 30, 0.98);
        border: 2px solid var(--otzar-cyan, #00f3ff);
        border-radius: 20px;
        box-shadow: 0 15px 50px rgba(0,0,0,0.9), 0 0 20px rgba(0, 243, 255, 0.2);
        z-index: 20000;
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 12px;
        pointer-events: auto;
        backdrop-filter: blur(10px);
        transition: opacity 0.2s, transform 0.2s;
        transform-origin: top left;
    }

    .awtsmoosContextMenu.hidden {
        display: none !important;
        opacity: 0;
        pointer-events: none;
    }


    @keyframes ctxPop {
        from { opacity: 0; transform: scale(0.8) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .ctx-title-group {
        border-bottom: 2px dashed rgba(0, 243, 255, 0.3);
        padding-bottom: 15px;
        margin-bottom: 8px;
    }

    .ctx-title { 
        color: var(--otzar-gold, #ffde40); 
        font-weight: 900; 
        font-size: 18px; 
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .ctx-type { 
        color: #ff00ff; 
        font-size: 11px; 
        opacity: 0.9; 
        font-family: 'Fira Code', monospace; 
        background: rgba(255, 0, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
    }

    .ctx-desc { 
        color: #eee; 
        font-size: 13px; 
        line-height: 1.5; 
        margin-top: 10px; 
        font-style: italic;
        opacity: 0.85;
    }

    .ctx-btn {
        background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 14px;
        text-align: left;
        color: white;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .ctx-btn:hover {
        background: var(--otzar-cyan, #00f3ff);
        color: black;
        border-color: white;
        transform: scale(1.02) translateX(8px);
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
    }

    .ctx-btn::after {
        content: '→';
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.2s;
    }

    .ctx-btn:hover::after {
        opacity: 1;
        transform: translateX(0);
    }
`;
