
/**
 * B"H
 * Console Blueprint: The definitive architectural mapping.
 * Incorporates a Top Bar for settings, Select/Start hardware buttons, 
 * and an overlay-interface.
 */
export const ConsoleBlueprint = {
    t: 'div', a: { id: 'holy-console', class: 'master-console-shell', style: {
        width: '500px', height: '900px', background: '#1c1d22', 
        borderRadius: '40px 40px 100px 40px', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', border: '5px solid #111',
        boxShadow: '0 60px 120px #000', position: 'relative', overflow: 'hidden'
    }}, c: [
        // Top Exalted Settings Bar (Hamburger / Menu toggle)
        { t: 'div', a: { id: 'settings-trigger', class: 'ctrl-sig', 'data-sig': 'MENU_TOGGLE', style: { width: '100%', height: '50px', background: '#25262c', display: 'flex', alignItems: 'center', padding: '0 25px', cursor: 'pointer', borderBottom: '2px solid #000' } }, c: [
            { t: 'div', a: { style: { display: 'flex', flexDirection: 'column', gap: '5px' } }, c: [
                { t: 'div', a: { style: { width: '30px', height: '4px', background: '#888' } } },
                { t: 'div', a: { style: { width: '30px', height: '4px', background: '#888' } } },
                { t: 'div', a: { style: { width: '30px', height: '4px', background: '#888' } } }
            ]},
            { t: 'div', a: { text: 'OHR HAGANUZ SETTINGS', style: { marginLeft: '20px', fontSize: '10px', color: '#666', letterSpacing: '2px' } } }
        ]},

        // Screen Bezel with Overlay Logic
        { t: 'div', a: { id: 'bezel', style: { width: '460px', height: '500px', background: '#000', marginTop: '30px', borderRadius: '25px', border: '12px solid #2e3038', position: 'relative', overflow: 'hidden' } }, c: [
            { t: 'div', a: { id: 'screen-area', style: { width: '100%', height: '100%', position: 'relative' } }, c: [
                { t: 'canvas', a: { id: 'layer-bg', width: '460', height: '500', style: { width:'100%', height:'100%', position:'absolute', zIndex:10, imageRendering:'pixelated' } } },
                { t: 'canvas', a: { id: 'layer-obj', width: '460', height: '500', style: { width:'100%', height:'100%', position:'absolute', zIndex:20, imageRendering:'pixelated' } } },
                { t: 'canvas', a: { id: 'layer-over', width: '460', height: '500', style: { width:'100%', height:'100%', position:'absolute', zIndex:30, imageRendering:'pixelated' } } },
                
                // Hardware Overlay (The D-Pad and Buttons that rest ON the screen)
                { t: 'div', a: { id: 'controls-overlay', style: { position: 'absolute', inset:0, zIndex: 100, pointerEvents: 'none' } }, c: [
                    { t: 'div', a: { id: 'dpad', style: { position: 'absolute', bottom: '20px', left: '20px', width: '140px', height: '140px', pointerEvents: 'auto', opacity: '0.6' } }, c: [
                        { t: 'div', a: { class: 'ctrl-sig', id: 'btn-U', 'data-sig': 'U', style: { position: 'absolute', top:0, left:'45px', width:'50px', height:'60px', background:'#111', borderRadius:'10px' } } },
                        { t: 'div', a: { class: 'ctrl-sig', id: 'btn-D', 'data-sig': 'D', style: { position: 'absolute', bottom:0, left:'45px', width:'50px', height:'60px', background:'#111', borderRadius:'10px' } } },
                        { t: 'div', a: { class: 'ctrl-sig', id: 'btn-L', 'data-sig': 'L', style: { position: 'absolute', top:'45px', left:0, width:'60px', height:'50px', background:'#111', borderRadius:'10px' } } },
                        { t: 'div', a: { class: 'ctrl-sig', id: 'btn-R', 'data-sig': 'R', style: { position: 'absolute', top:'45px', right:0, width:'60px', height:'50px', background:'#111', borderRadius:'10px' } } }
                    ]},
                    { t: 'div', a: { id: 'actions', style: { position: 'absolute', bottom: '30px', right: '20px', width: '170px', height: '120px', pointerEvents: 'auto', transform: 'rotate(-15deg)', opacity: '0.8' } }, c: [
                        { t: 'div', a: { class: 'ctrl-sig', id: 'btn-B', 'data-sig': 'B', style: { position: 'absolute', bottom: 0, left: 0, width: '75px', height: '75px', borderRadius: '50%', background: '#333', color: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', border: '3px solid #111' }, text: 'B' } },
                        { t: 'div', a: { class: 'ctrl-sig', id: 'btn-A', 'data-sig': 'A', style: { position: 'absolute', top: 0, right: 0, width: '75px', height: '75px', borderRadius: '50%', background: '#900', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', border: '3px solid #500' }, text: 'A' } }
                    ]}
                ]}
            ]}
        ]},

        // Hardware Foundation (Bottom Console Controls)
        { t: 'div', a: { id: 'foundation-deck', style: { flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', gap: '60px' } }, c: [
            { t: 'div', a: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, c: [
                { t: 'div', a: { class: 'ctrl-sig', id: 'btn-SEL', 'data-sig': 'SEL', style: { width: '50px', height: '14px', background: '#111', borderRadius: '10px', border: '2px solid #333' } } },
                { t: 'div', a: { text: 'SELECT', style: { fontSize: '8px', color: '#666', marginTop: '10px', letterSpacing: '2px' } } }
            ]},
            { t: 'div', a: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, c: [
                { t: 'div', a: { class: 'ctrl-sig', id: 'btn-START', 'data-sig': 'START', style: { width: '50px', height: '14px', background: '#111', borderRadius: '10px', border: '2px solid #333' } } },
                { t: 'div', a: { text: 'START', style: { fontSize: '8px', color: '#666', marginTop: '10px', letterSpacing: '2px' } } }
            ]}
        ]}
    ]
};
