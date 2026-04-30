
import { AwtsmoosConstants } from '../themes/AwtsmoosConstants.js';

/**
 * B"H
 * @file GenesisLandingStyles.js
 * @description
 * 🌠 THE PROCESS OF CONSTRICTION (TZIMTZUM) 🌠
 * The intense screen bridging the user's finite perception into the 
 * infinite simulation. Includes glowing progressing light paths representing Seder Seder Hishtalshelus.
 */
export const GenesisLandingStyles = {
    '.tzimtzum-gate': {
        position: 'fixed',
        inset: '0',
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)', // Breathtaking deep blur overlay over the main menu!
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: AwtsmoosConstants.typology.ancientMono,
        color: AwtsmoosConstants.colors.keterWhite,
        zIndex: '500', // Higher than menu!
        animation: 'awakenFromVoid 1s ease-out',
        transition: 'opacity 1.5s ease-out'
    },
    '.atzmus-pulse-text': {
        fontSize: '1.5rem',
        color: AwtsmoosConstants.colors.sefirahGold,
        marginBottom: AwtsmoosConstants.metrics.spacingHuge,
        animation: 'crownGleamText 2.5s infinite linear'
    },
    '.sefira-container-track': {
        width: '75%',
        maxWidth: '800px',
        height: '35px',
        backgroundColor: AwtsmoosConstants.colors.voidMidtone,
        border: `2px solid ${AwtsmoosConstants.colors.emeraldEinSof}`,
        borderRadius: AwtsmoosConstants.metrics.radiusVessel,
        padding: '3px',
        boxShadow: `0 0 20px rgba(0, 0, 0, 0.9)`,
        position: 'relative'
    },
    '.ein-sof-light-stream': {
        height: '100%',
        width: '5%', 
        borderRadius: '16px',
        background: `linear-gradient(90deg, ${AwtsmoosConstants.colors.emeraldShadow}, ${AwtsmoosConstants.colors.emeraldEinSof}, ${AwtsmoosConstants.colors.keterWhite})`,
        backgroundSize: '200% 100%',
        transition: 'width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animation: 'orbitLoaderBar 2s ease infinite'
    },
    '.divine-commentary': {
        marginTop: AwtsmoosConstants.metrics.spacingGolden,
        fontSize: '1.1rem',
        color: AwtsmoosConstants.colors.textDust,
        letterSpacing: '1px',
        fontWeight: 'bold',
        textAlign: 'center'
    }
};
