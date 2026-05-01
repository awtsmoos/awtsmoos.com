
/**
 * B"H
 * @module SlotsSkin
 * @description
 * THE KELIM OF MANIFESTATION
 * 
 * "And he made the vessels..."
 * This module defines the aesthetic of individual inventory slots.
 */
export default /*css*/`
    .equip-slots-holder {
        width: 320px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 32px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 30px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.4);
    }

    .equipment-slots {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        justify-items: center;
        align-items: center;
    }

    .main-slots-holder {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0; /* B"H: Prevent flex blowout */
    }

    .slots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        grid-auto-rows: min-content;
        gap: 20px;
        overflow-y: auto;
        padding: 10px;
        flex: 1;
    }

    .inventory-slot {
        width: 100%;
        max-width: 120px;
        aspect-ratio: 1;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        position: relative;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }


    .inventory-slot::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
    }

    .inventory-slot:hover {
        border-color: rgba(0, 243, 255, 0.5);
        background: rgba(0, 243, 255, 0.05);
        transform: translateY(-4px);
        box-shadow: 
            0 15px 30px -10px rgba(0, 0, 0, 0.5),
            0 0 15px rgba(0, 243, 255, 0.2);
    }

    .inventory-slot:hover::before {
        opacity: 1;
    }

    .inventory-slot.occupied {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .inventory-slot.equipped {
        border-color: var(--otzar-gold, #ffde40);
        background: rgba(255, 222, 64, 0.05);
        box-shadow: 0 0 20px rgba(255, 222, 64, 0.15);
    }

    .slot-icon {
        width: 80%;
        height: 80%;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        filter: drop-shadow(0 8px 15px rgba(0,0,0,0.3));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 44px;
        z-index: 2;
    }

    .inventory-slot:hover .slot-icon {
        transform: scale(1.1) translateY(-5px);
    }

    .locked-icon {
        opacity: 0.15;
        filter: grayscale(1) brightness(0.5);
        transform: scale(0.9);
    }

    .qty-badge {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: linear-gradient(135deg, var(--otzar-cyan, #00f3ff) 0%, #00a8ff 100%);
        color: #000;
        font-family: 'Outfit', sans-serif;
        font-weight: 900;
        font-size: 13px;
        padding: 4px 12px;
        border-radius: 12px;
        pointer-events: none;
        box-shadow: 0 5px 15px rgba(0, 243, 255, 0.3);
        z-index: 5;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

`;

