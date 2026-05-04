
/**
 * B"H
 * ConsoleStyles: The garments of the physical vessel.
 * Mapping abstract aesthetic choices into hard pixel constraints.
 */
export const ConsoleStyles = {
    bezel: {
        width: '420px', height: '420px', background: '#4a4f5a', marginTop: '35px',
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        borderRadius: '20px 20px 50px 20px', border: '8px solid #111', 
        boxShadow: 'inset 0 20px 50px rgba(0,0,0,0.9), 0 5px 15px rgba(0,0,0,0.5)'
    },
    screen: { 
        position: 'relative', width: '360px', height: '360px', background: '#000', 
        overflow: 'hidden', boxShadow: '0 0 20px #000' 
    },
    canvas: { 
        width: '100%', height: '100%', position: 'absolute', top:'0', left:'0', 
        imageRendering: 'pixelated' 
    },
    dpadContainer: { position: 'absolute', top: '50px', left: '40px', width: '160px', height: '160px' },
    actionContainer: { position: 'absolute', top: '60px', right: '35px', width: '180px', height: '140px', transform: 'rotate(-20deg)' }
};
