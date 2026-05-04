
/**
 * B"H
 * "And the hands of Moshe were heavy..." (Exodus 17:12).
 * This module defines the architectural vessel of the D-PAD and Action Buttons. 
 * Formed entirely of data, these objects await the Divine Speech Generator
 * to coalesce them into physical DOM elements on the screen glass.
 * They represent the direct channel for human Will to interface with the Awtsmoos simulation.
 */

const BtnStyle = {
    position: 'absolute', width: '40px', height: '40px', background: '#1c1c1c', 
    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.8), inset -1px -1px 2px rgba(255,255,255,0.1)', cursor: 'pointer', zIndex: '200'
};

const ActionBtnStyle = {
    position: 'absolute', width: '50px', height: '50px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #a00, #500)', boxShadow: '0 5px 10px #000, inset 2px 2px 5px #f66',
    color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer'
};

export const GamepadBlueprint = {
    t: 'div', a: { id: 'controls-wrapper', style: { width: '100%', height: '100%', position: 'relative' } }, c: [
        // Directional Pad
        { t: 'div', a: { style: { position: 'absolute', top: '20px', left: '20px', width: '120px', height: '120px' } }, c: [
            { t: 'div', a: { id: 'btn-U', style: { ...BtnStyle, top: '0', left: '40px', borderRadius: '8px 8px 0 0' } } },
            { t: 'div', a: { id: 'btn-D', style: { ...BtnStyle, bottom: '0', left: '40px', borderRadius: '0 0 8px 8px' } } },
            { t: 'div', a: { id: 'btn-L', style: { ...BtnStyle, top: '40px', left: '0', borderRadius: '8px 0 0 8px' } } },
            { t: 'div', a: { id: 'btn-R', style: { ...BtnStyle, top: '40px', right: '0', borderRadius: '0 8px 8px 0' } } },
            { t: 'div', a: { style: { ...BtnStyle, top: '40px', left: '40px', background: '#151515', boxShadow: 'none' } }, c: [
                { t: 'div', a: { style: { position: 'absolute', top:'25%', left:'25%', width:'50%', height:'50%', background:'#0a0a0a', borderRadius:'50%' } } }
            ] }
        ]},
        // Action Buttons A/B
        { t: 'div', a: { style: { position: 'absolute', top: '30px', right: '20px', width: '120px', height: '100px', transform: 'rotate(-15deg)' } }, c: [
            { t: 'div', a: { id: 'btn-B', style: { ...ActionBtnStyle, bottom: '0', left: '0', background: 'linear-gradient(135deg, #444, #111)' }, text: 'B' } },
            { t: 'div', a: { id: 'btn-A', style: { ...ActionBtnStyle, top: '0', right: '0' }, text: 'A' } }
        ]},
        // System Buttons (Select/Start)
        { t: 'div', a: { style: { position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '30px' } }, c: [
            { t: 'div', a: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, c: [
                { t: 'div', a: { id: 'btn-SEL', style: { width: '40px', height: '12px', background: '#111', borderRadius: '10px', border: '1px solid #333' } } },
                { t: 'div', a: { text: 'SELECT', style: { fontSize: '8px', color: '#666', marginTop: '5px', letterSpacing: '1px' } } }
            ]},
            { t: 'div', a: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, c: [
                { t: 'div', a: { id: 'btn-START', style: { width: '40px', height: '12px', background: '#111', borderRadius: '10px', border: '1px solid #333' } } },
                { t: 'div', a: { text: 'START', style: { fontSize: '8px', color: '#666', marginTop: '5px', letterSpacing: '1px' } } }
            ]}
        ]}
    ]
};
