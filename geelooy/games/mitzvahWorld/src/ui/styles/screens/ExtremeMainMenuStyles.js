
import { AwtsmoosConstants } from '../themes/AwtsmoosConstants.js';

/**
 * B"H
 * @file ExtremeMainMenuStyles.js
 * @description
 * 🏰 THE TEMPLE DOORS OF REALITY 🏰
 * 
 * We abandon the simple buttons for an extreme configuration. Massive pill buttons,
 * golden borders indicating spiritual value, deeply satisfying transitions based on 
 * CSS json logic.
 */
export const ExtremeMainMenuStyles = {
    '.olam-menu-vessel': {
        position: 'fixed',
        inset: '0',
        backgroundColor: AwtsmoosConstants.colors.tzimtzumAbyss,
        backgroundImage: `radial-gradient(circle at center, ${AwtsmoosConstants.colors.voidMidtone} 0%, ${AwtsmoosConstants.colors.tzimtzumAbyss} 80%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: AwtsmoosConstants.typology.ancientMono,
        animation: 'awakenFromVoid 1.5s ease-out forwards',
        zIndex: '100',
        overflow: 'hidden'
    },
    '.main-divine-title': {
        fontSize: '4.5rem',
        fontFamily: AwtsmoosConstants.typology.epicTitles,
        color: AwtsmoosConstants.colors.keterWhite,
        letterSpacing: '12px',
        margin: '0',
        marginBottom: AwtsmoosConstants.metrics.spacingHuge,
        animation: 'crownGleamText 4s infinite',
        textTransform: 'uppercase'
    },
    '.sefirotic-btn-group': {
        display: 'flex',
        flexDirection: 'column',
        gap: AwtsmoosConstants.metrics.spacingGolden,
        width: '100%',
        maxWidth: '450px'
    },
    '.mitzvah-btn-extreme': {
        width: '100%',
        padding: '22px 30px',
        backgroundColor: AwtsmoosConstants.colors.emeraldShadow,
        border: `3px solid ${AwtsmoosConstants.colors.emeraldEinSof}`,
        borderRadius: AwtsmoosConstants.metrics.radiusPill,
        color: AwtsmoosConstants.colors.keterWhite,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        cursor: 'pointer',
        boxShadow: `0px 10px 30px rgba(0,0,0,0.8)`,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        '_pseudo': {
            ':hover': {
                backgroundColor: AwtsmoosConstants.colors.emeraldEinSof,
                color: AwtsmoosConstants.colors.tzimtzumAbyss,
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: `0px 20px 40px ${AwtsmoosConstants.colors.emeraldShadow}`
            },
            ':active': {
                transform: 'translateY(2px) scale(0.98)',
                boxShadow: 'none'
            }
        }
    },
    '.footer-sig': {
        position: 'absolute',
        bottom: AwtsmoosConstants.metrics.spacingGolden,
        color: AwtsmoosConstants.colors.textDust,
        fontSize: '0.9rem',
        opacity: '0.6'
    }
};
