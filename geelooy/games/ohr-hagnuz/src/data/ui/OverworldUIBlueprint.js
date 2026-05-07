
/**
 * B"H
 * @module OverworldUIBlueprint
 * @chapter The Garments of the Field
 * @description
 * Defines the persistent HTML overlay for the Overworld.
 * Contains the gateway to the Sacred Library (The Bag), allowing mortal 
 * clicks to pierce through to the inventory dimension without needing a keyboard.
 */
export const OverworldUIBlueprint = {
    tag: 'div',
    id: 'awtsmoos-overworld-ui',
    style: {
        position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '8000',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', padding: '20px'
    },
    children: [
        {
            tag: 'div',
            id: 'btn-open-bag',
            attrs: { class: 'overworld-btn' },
            style: {
                pointerEvents: 'auto', background: 'rgba(10, 15, 25, 0.9)',
                border: '2px solid #00e5ff', borderRadius: '8px',
                color: '#84ffff', padding: '15px 25px', fontFamily: '"Share Tech Mono", monospace',
                fontSize: '20px', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)', textShadow: '0 0 5px #00e5ff',
                transition: 'all 0.2s', userSelect: 'none'
            },
            text: '🎒 SACRED BAG'
        }
    ]
};
