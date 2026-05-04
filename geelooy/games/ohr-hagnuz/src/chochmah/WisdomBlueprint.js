
/**
 * B"H
 * WisdomBlueprint: The Architecture of Malchut.
 * Defines the one and only physical shell.
 */
export const ConsoleBlueprint = {
    t: 'div', a: { id: 'holy-console', class: 'master-console-shell', style: {
        width: '500px', height: '900px', background: '#202025', 
        borderRadius: '40px 40px 110px 40px', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', border: '6px solid #101015',
        boxShadow: '0 80px 160px #000', position: 'relative', overflow: 'hidden'
    }}, c: [
        // Speaker
        { t: 'div', a: { style: { width: '150px', height: '20px', background: '#050505', marginTop: '45px', borderRadius: '10px', boxShadow: 'inset 3px 3px 10px #000' } } },
        
        // Vast Screen Bezel
        { t: 'div', a: { id: 'bezel', style: {
            width: '460px', height: '540px', background: '#000', marginTop: '35px',
            borderRadius: '30px', border: '12px solid #323540', position: 'relative',
            overflow: 'hidden', boxShadow: 'inset 0 0 60px #000'
        }}, c: [
            { t: 'div', a: { id: 'screen-area', style: { width: '100%', height: '100%', position: 'relative' } }, c: [
                { t: 'canvas', a: { id: 'layer-bg', width: '460', height: '540', style: { width:'100%', height:'100%', position:'absolute', zIndex:10, imageRendering:'pixelated' } } },
                { t: 'canvas', a: { id: 'layer-obj', width: '460', height: '540', style: { width:'100%', height:'100%', position:'absolute', zIndex:20, imageRendering:'pixelated' } } },
                { t: 'canvas', a: { id: 'layer-over', width: '460', height: '540', style: { width:'100%', height:'100%', position:'absolute', zIndex:30, imageRendering:'pixelated' } } },
                
                // Controls Layer (Overlaying Screen)
                { t: 'div', a: { style: { position: 'absolute', inset:0, zIndex:100, pointerEvents: 'none' } }, c: [
                    { t: 'div', a: { style: { position: 'absolute', bottom: '30px', left: '30px', width: '140px', height: '140px', pointerEvents: 'auto', opacity: '0.65' } }, c: [
                        { t: 'div', a: { class: 'ctrl-sig', 'data-sig': 'U', style: { position:'absolute', top:0, left:'45px', width:'50px', height:'65px', background:'#111', border:'3px solid #333', borderRadius:'12px' } } },
                        { t: 'div', a: { class: 'ctrl-sig', 'data-sig': 'D', style: { position:'absolute', bottom:0, left:'45px', width:'50px', height:'65px', background:'#111', border:'3px solid #333', borderRadius:'12px' } } },
                        { t: 'div', a: { class: 'ctrl-sig', 'data-sig': 'L', style: { position:'absolute', top:'45px', left:0, width:'65px', height:'50px', background:'#111', border:'3px solid #333', borderRadius:'12px' } } },
                        { t: 'div', a: { class: 'ctrl-sig', 'data-sig': 'R', style: { position:'absolute', top:'45px', right:0, width:'65px', height:'50px', background:'#111', border:'3px solid #333', borderRadius:'12px' } } }
                    ]},
                    { t: 'div', a: { style: { position: 'absolute', bottom: '40px', right: '30px', width: '180px', height: '140px', pointerEvents: 'auto', opacity: '0.8', transform: 'rotate(-15deg)' } }, c: [
                        { t: 'div', a: { class: 'ctrl-sig', 'data-sig': 'B', style: { position:'absolute', bottom:0, left:0, width:'85px', height:'85px', borderRadius:'50%', background:'#353535', border:'5px solid #111', color:'#ccc', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold', fontSize:'24px' }, text: 'B' } },
                        { t: 'div', a: { class: 'ctrl-sig', 'data-sig': 'A', style: { position:'absolute', top:0, right:0, width:'85px', height:'85px', borderRadius:'50%', background:'#a30000', border:'5px solid #500', color:'#fff', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold', fontSize:'24px' }, text: 'A' } }
                    ]}
                ]}
            ]}
        ]}
    ]
};
