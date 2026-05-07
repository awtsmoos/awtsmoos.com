
/**
 * B"H
 * @class State
 * @chapter The Architecture of Memory
 * @description
 * In the realm of Binah, the Infinite Light is contracted into 
 * distinct vessels of information. This class tracks the state of the Tzaddik 
 * as they navigate the physical grid of Asiyah.
 */
export class State {
    static ActiveRealm = 'OVERWORLD';
    static MapId = 'Overworld_Main';
    
    static Resolution = 64; // Pixels per tile
    static Speed = 4;       // Pixels per frame

    /**
     * The kinetic vessel of the Hero.
     * dx/dy are the physical manifestations in Malchut.
     * cx/cy are the conceptual coordinates in Binah.
     */
    static Hero = {
        cx: 12, cy: 7,
        dx: 12 * 64,
        dy: 7 * 64,
        dir: 'd',
        moving: false,
        stepTick: 0
    };

    static Stats = {
        light: 100,
        maxLight: 100,
        level: 1
    };
}

// The direct interface of human Will
window.AwtsmoosIntents = { U:0, D:0, L:0, R:0, A:0, B:0 };
