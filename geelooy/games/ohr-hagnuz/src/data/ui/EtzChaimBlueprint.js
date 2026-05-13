
/**
 * B"H
 * @module EtzChaimBlueprint
 * @chapter The Tree of Life Interface
 * @description
 * Defines the material HTML shell for the Tzaddik to invest their Spark Points
 * into their internal Sefirotic structure.
 */
export const EtzChaimBlueprint = {
    tag: 'div',
    id: 'awtsmoos-etz-chaim-ui',
    style: {
        position: 'absolute', top: '5%', left: '5%', width: '90%', height: '90%',
        backgroundColor: 'rgba(5, 10, 5, 0.98)', border: '3px solid #6cb246',
        color: '#e0f7fa', fontFamily: '"Share Tech Mono", monospace', padding: '30px',
        display: 'none', flexDirection: 'column', zIndex: '9998',
        boxShadow: '0 0 50px #000, inset 0 0 40px rgba(108, 178, 70, 0.3)', 
        borderRadius: '20px', boxSizing: 'border-box', overflow: 'hidden'
    },
    children:[
        {
            tag: 'div',
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #6cb246', paddingBottom: '15px', zIndex: '10' },
            children:[
                { tag: 'h1', text: 'B"H - ETZ CHAIM (TREE OF LIFE)', style: { color: '#81c784', letterSpacing: '4px', margin: '0', textShadow: '0 0 10px #4caf50' } },
                { 
                    tag: 'div', style: { display: 'flex', gap: '20px', alignItems: 'center' }, children:[
                        { tag: 'div', id: 'spark-points-display', text: 'Sparks: 0', style: { fontSize: '24px', fontWeight: 'bold', color: '#ffd54f', textShadow: '0 0 10px #ffca28' } },
                        { 
                            tag: 'div', 
                            id: 'btn-close-etz',
                            text: '✖ CLOSE', 
                            style: { 
                                background: '#b71c1c', padding: '10px 20px', borderRadius: '5px', 
                                cursor: 'pointer', fontWeight: 'bold', border: '1px solid #ff5252',
                                boxShadow: '0 0 10px rgba(255,0,0,0.5)', transition: 'all 0.2s',
                                userSelect: 'none'
                            } 
                        }
                    ]
                }
            ]
        },
        { 
            tag: 'div', 
            id: 'etz-chaim-canvas', 
            style: { 
                flexGrow: 1, position: 'relative', width: '100%', 
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            } 
        }
    ]
};
