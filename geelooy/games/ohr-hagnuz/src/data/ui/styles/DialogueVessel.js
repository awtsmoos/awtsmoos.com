
/**
 * B"H
 * @module DialogueVessel
 * @chapter The Garments of Speech
 * @description
 * Defines the appearance of words, menus, and the interactive options
 * presented to the Tzaddik during their journey.
 */
export const DialogueVessel = `
    /* Dialogue Box Vessel */
    .awtsmoos-dialogue-vessel {
        background: linear-gradient(135deg, rgba(10, 15, 25, 0.98), rgba(20, 5, 30, 0.98));
        border: 2px solid transparent;
        border-radius: 12px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.9), inset 0 0 25px rgba(0, 229, 255, 0.3);
        animation: slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        backdrop-filter: blur(12px);
        font-family: 'Share Tech Mono', monospace;
    }

    .awtsmoos-cursor {
        display: inline-block;
        width: 14px;
        height: 26px;
        background: #00e5ff;
        animation: divinePulse 1s infinite;
        vertical-align: middle;
        margin-left: 5px;
        box-shadow: 0 0 15px #00e5ff;
    }

    .dialogue-option {
        padding: 10px 20px;
        border: 1px solid #444;
        background: rgba(0,0,0,0.6);
        color: #999;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 6px;
        font-size: 20px;
    }

    .dialogue-option.active {
        background: rgba(0, 229, 255, 0.2);
        border-color: #00e5ff;
        color: #fff;
        text-shadow: 0 0 10px #00e5ff;
        transform: translateX(15px);
        box-shadow: inset 0 0 15px rgba(0, 229, 255, 0.2);
    }

    /* Battle Action Buttons */
    .battle-action-btn {
        font-family: 'Share Tech Mono', monospace;
        background: rgba(10,15,20,0.95);
        border: 1px solid #444;
        color: #bbb;
        text-transform: uppercase;
        letter-spacing: 3px;
        transition: all 0.2s;
        cursor: pointer;
        user-select: none; 
        z-index: 200;
        font-size: 18px;
    }

    .battle-action-btn:hover {
        background: rgba(0, 229, 255, 0.15);
        border-color: #84ffff;
        box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
        color: #fff;
    }

    .battle-action-btn.active-intent {
        background: rgba(0, 229, 255, 0.3);
        border-color: #00e5ff;
        color: #fff;
        box-shadow: 0 0 30px rgba(0, 229, 255, 0.7);
        transform: scale(1.05);
        text-shadow: 0 0 10px #00e5ff;
        font-weight: bold;
    }
`;
