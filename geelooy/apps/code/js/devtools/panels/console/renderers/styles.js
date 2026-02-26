
// B"H
/**
 * @file styles.js
 * @brief The Palette of the Console.
 */

export const LogStyles = {
    base: { 
        padding: '6px 0', 
        borderBottom: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'baseline', 
        gap: '8px', 
        lineHeight: '1.5',
        width: '100%'
    },
    
    input: {
        color: 'var(--color-text-secondary)', 
        borderTop: '1px dashed rgba(255,255,255,0.1)',
        alignItems: 'flex-start'
    },
    
    error: { 
        color: 'var(--color-accent-danger)', 
        backgroundColor: 'rgba(247,93,101,0.05)', 
        borderLeft: '3px solid var(--color-accent-danger)', 
        paddingLeft: '8px' 
    },
    
    warn: { 
        color: '#ffae57', 
        backgroundColor: 'rgba(255,174,87,0.05)', 
        borderLeft: '3px solid #ffae57', 
        paddingLeft: '8px' 
    },
    
    log: {
        color: '#a8ff00'
    }
};
