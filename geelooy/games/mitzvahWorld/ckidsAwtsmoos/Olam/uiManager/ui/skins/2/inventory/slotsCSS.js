
/**
 * B"H
 * @module slotsCSS
 * @description
 * "All the vessels were crafted with exact measurements."
 * This controls the visual dimensions and glowing aura of the sacred inventory slots.
 */

export default /*css*/`
.main-slots-holder {
    flex-grow: 1;
    background: linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2));
    border-radius: 12px;
    padding: 15px;
    overflow-y: auto;
    border: 2px solid rgba(0, 255, 237, 0.2);
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

.slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); 
    gap: 12px; 
    width: 100%;
}

.slots .actionSlot {
    width: 75px;
    height: 75px;
    background: #1a1a2e;
    border: 2px solid #00ffed;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative; 
    box-shadow: 0 6px 10px rgba(0,0,0,0.5);
    transition: all 0.2s ease;
}

.actionSlot.drag-hover-active {
    border-color: #bc13fe;
    box-shadow: 0 0 25px #bc13fe, inset 0 0 30px #bc13fe;
    transform: scale(1.15) rotate(2deg);
    z-index: 10;
    background: #2a0a4a;
    animation: slotPulse 0.4s infinite alternate;
}

@keyframes slotPulse {
    from { box-shadow: 0 0 15px #bc13fe, inset 0 0 20px #bc13fe; border-color: #bc13fe; }
    to { box-shadow: 0 0 35px #ff00ea, inset 0 0 45px #ff00ea; border-color: #ff00ea; transform: scale(1.2); }
}

.slots .innerSlot {
    width: 90%;
    height: 90%;
    background: #232342;
    border-radius: 8px;
    position: relative; 
    transition: all 0.2s;
}

.slots .actionSlot.occupied:hover .innerSlot {
    background: #3e3e8e;
    box-shadow: 0 0 20px #00ffed;
    cursor: pointer;
}

.equipped-indicator {
    border: 3px solid #FFD700;
    box-shadow: 0 0 15px #FFD700, inset 0 0 10px #FFD700;
}

.slotBtn {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: 80%;
    background-repeat: no-repeat;
    transition: transform 0.2s;
}
.actionSlot.occupied:hover .slotBtn {
    transform: scale(1.15);
}

.slotQuantity {
    position: absolute;
    bottom: -5px;
    right: -5px;
    color: #fff;
    font-weight: bold;
    font-size: 16px;
    text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
    background: rgba(0, 255, 237, 0.4);
    padding: 2px 6px;
    border-radius: 50%;
    border: 1px solid #00ffed;
}

.awtsmoos-tooltip {
    position: fixed;
    background: rgba(10, 5, 25, 0.95);
    border: 2px solid #00ffed;
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 14px;
    pointer-events: none;
    z-index: 999999;
    box-shadow: 0 5px 20px rgba(0, 255, 237, 0.5);
    font-family: 'Fredoka', sans-serif;
}
.awtsmoos-tooltip .header { color: #00ffed; font-family: 'Fredoka One'; font-size: 16px; border-bottom: 1px solid rgba(0,255,237,0.3); padding-bottom: 5px; margin-bottom: 5px; }
`;
