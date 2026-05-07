
/**
 * B"H
 * @chapter The Sacred Library
 * @description
 * The physical matrix for the Inventory dimension. Now equipped with a material 
 * button to fold this dimension and return to Asiyah.
 */
export const InventoryBlueprint = {
    tag: 'div',
    id: 'awtsmoos-inventory',
    style: {
        position: 'absolute', top: '5%', left: '5%', width: '90%', height: '90%',
        backgroundColor: 'rgba(10, 10, 20, 0.98)', border: '2px solid #00e5ff',
        color: '#e0f7fa', fontFamily: '"Share Tech Mono", monospace', padding: '30px',
        display: 'none', flexDirection: 'column', zIndex: '9999',
        boxShadow: '0 0 50px #000, inset 0 0 30px rgba(0, 229, 255, 0.2)', 
        borderRadius: '15px', boxSizing: 'border-box'
    },
    children: [
        {
            tag: 'div',
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #444', paddingBottom: '15px' },
            children: [
                { tag: 'h1', text: 'B"H - SACRED LIBRARY', style: { color: '#ffd54f', letterSpacing: '4px', margin: '0', textShadow: '0 0 10px #ffc107' } },
                { 
                    tag: 'div', 
                    id: 'btn-close-bag',
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
        { tag: 'div', id: 'inventory-content', style: { flexGrow: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '20px', alignContent: 'flex-start' } },
        { tag: 'div', text: 'Knowledge gathered here will serve you in the debates against the Klipot.', style: { textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px', fontStyle: 'italic' } }
    ]
};
