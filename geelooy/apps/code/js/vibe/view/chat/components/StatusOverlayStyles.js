
// B"H
export const StatusOverlayStyles = {
    overlay: {
        display: 'flex', flexDirection: 'column', gap: '8px',
        padding: '10px 18px', background: 'rgba(13, 17, 23, 0.98)',
        borderRadius: '12px', border: '1px solid rgba(0, 246, 255, 0.4)',
        margin: '10px auto', width: 'fit-content', pointerEvents: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.9)', position: 'relative',
        backdropFilter: 'blur(15px)', zIndex: '1000'
    },
    selectorGroup: {
        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
        padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s'
    },
    pickerModal: {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
        background: '#0d0f14', border: '2px solid var(--neon-cyan)', borderRadius: '12px',
        zIndex: '100000', padding: '24px', color: '#fff', boxShadow: '0 0 50px #000'
    }
};
