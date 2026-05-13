
/**
 * B"H
 * @chapter The Scroll of Decrees
 * @description
 * Defines the material HTML shell for viewing active and completed missions.
 */
export const ShlichusBlueprint = {
    tag: 'div',
    id: 'awtsmoos-shlichus-log',
    style: {
        position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
        backgroundColor: 'rgba(15, 5, 25, 0.98)', border: '3px solid #ea80fc',
        color: '#f3e5f5', fontFamily: '"Share Tech Mono", monospace', padding: '30px',
        display: 'none', flexDirection: 'column', zIndex: '9995',
        boxShadow: '0 0 50px #000, inset 0 0 30px rgba(234, 128, 252, 0.2)', 
        borderRadius: '15px', boxSizing: 'border-box'
    },
    children:[
        {
            tag: 'div',
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ea80fc', paddingBottom: '15px' },
            children:[
                { tag: 'h1', text: 'B"H - DIVINE SHLICHUS', style: { color: '#ea80fc', letterSpacing: '4px', margin: '0', textShadow: '0 0 10px #aa00ff' } },
                { 
                    tag: 'div', 
                    id: 'btn-close-shlichus',
                    text: '✖ CLOSE', 
                    style: { 
                        background: '#b71c1c', padding: '10px 20px', borderRadius: '5px', 
                        cursor: 'pointer', fontWeight: 'bold', border: '1px solid #ff5252',
                        boxShadow: '0 0 10px rgba(255,0,0,0.5)', transition: 'all 0.2s',
                        userSelect: 'none'
                    } 
                }
            ]
        },
        { tag: 'div', id: 'shlichus-content', style: { flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' } }
    ]
};
