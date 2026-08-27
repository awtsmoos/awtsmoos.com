
// B"H
export const PickerStyles = {
    box: {
        background: '#0a0c10', border: '2px solid var(--neon-cyan)', 
        borderRadius: '16px', width: '650px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 20px rgba(0, 246, 255, 0.1)'
    },
    sectionTitle: {
        fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
        letterSpacing: '1px', marginBottom: '12px', display: 'block'
    },
    keyCard: (isActive) => ({
        padding: '12px 16px', borderRadius: '8px', 
        border: `1px solid ${isActive ? 'var(--neon-cyan)' : '#222'}`,
        background: isActive ? 'rgba(0, 246, 255, 0.05)' : 'rgba(255,255,255,0.02)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '8px'
    }),
    addBox: {
        padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
        border: '1px solid #222', marginTop: '10px'
    },
    link: {
        color: 'var(--neon-cyan)', fontSize: '11px', textDecoration: 'underline',
        cursor: 'pointer', opacity: 0.8
    }
};
