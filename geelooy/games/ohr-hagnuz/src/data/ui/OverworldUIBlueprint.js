
/**
 * B"H
 * @module OverworldUIBlueprint
 * @chapter The Garments of the Field
 * @description
 * Defines the persistent HTML overlay for the Overworld.
 */
export const OverworldUIBlueprint = {
    tag: 'div',
    id: 'awtsmoos-overworld-ui',
    style: {
        position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '8000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px'
    },
    children:[
        {
            tag: 'div', style: { display: 'flex', gap: '15px' }, children:[
                {
                    tag: 'div',
                    id: 'btn-open-shlichus',
                    attrs: { class: 'overworld-btn' },
                    style: {
                        pointerEvents: 'auto', background: 'rgba(20, 5, 30, 0.9)',
                        border: '2px solid #ea80fc', borderRadius: '8px',
                        color: '#ea80fc', padding: '15px 25px', fontFamily: '"Share Tech Mono", monospace',
                        fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)', textShadow: '0 0 5px #aa00ff',
                        transition: 'all 0.2s', userSelect: 'none'
                    },
                    text: '📜 SHLICHUS'
                },
                {
                    tag: 'div',
                    id: 'btn-open-etz',
                    attrs: { class: 'overworld-btn' },
                    style: {
                        pointerEvents: 'auto', background: 'rgba(5, 20, 5, 0.9)',
                        border: '2px solid #6cb246', borderRadius: '8px',
                        color: '#81c784', padding: '15px 25px', fontFamily: '"Share Tech Mono", monospace',
                        fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)', textShadow: '0 0 5px #4caf50',
                        transition: 'all 0.2s', userSelect: 'none'
                    },
                    text: '🌳 ETZ CHAIM'
                }
            ]
        },
        {
            tag: 'div',
            id: 'btn-open-bag',
            attrs: { class: 'overworld-btn' },
            style: {
                pointerEvents: 'auto', background: 'rgba(10, 15, 25, 0.9)',
                border: '2px solid #00e5ff', borderRadius: '8px',
                color: '#84ffff', padding: '15px 25px', fontFamily: '"Share Tech Mono", monospace',
                fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)', textShadow: '0 0 5px #00e5ff',
                transition: 'all 0.2s', userSelect: 'none'
            },
            text: '🎒 SACRED BAG'
        }
    ]
};
