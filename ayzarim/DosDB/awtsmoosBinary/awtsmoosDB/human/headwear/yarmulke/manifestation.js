
import { Vessel } from '../../../core/existence/vessel.js';
import { getYarmulkeStyle } from './blueprint.js';

/**
 * @class YarmulkeManifestation
 * @extends Vessel
 * @description
 * The physical component of the Yarmulke. 
 * It takes the abstract coordinates of the Head (the "Heavens" of the Human Body)
 * and places itself upon them, serving as a reminder of the Creator.
 * 
 * Every time this component re-renders, it is being recreated 'Yesh M'ayin' 
 * (Something from Nothing) by the Maamar engine.
 */
export class YarmulkeManifestation extends Vessel {
    /**
     * @description Constructs the Yarmulke vessel.
     * @param {Object} data - Contains color, size, and anchor point.
     */
    constructor(data) {
        super(data);
    }

    /**
     * @description
     * The blueprint for the Yarmulke.
     * It uses the 'Style Scribe' from our blueprint file to determine its look.
     * 
     * @returns {Object} JSON definition for the creation engine.
     */
    blueprint() {
        const { x = '50%', y = '10%', ...rest } = this.data;
        
        return {
            tag: 'div',
            className: 'holy-hat yarmulke-vessel',
            style: {
                ...getYarmulkeStyle(rest),
                left: x,
                top: y
            },
            children: [
                {
                    tag: 'div',
                    className: 'texture-overlay',
                    style: {
                        width: '100%',
                        height: '100%',
                        opacity: '0.1',
                        backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%)',
                        backgroundSize: '3px 3px'
                    }
                }
            ],
            on: {
                click: () => console.log('B"H: The user remembers the Creator.')
            }
        };
    }
}
