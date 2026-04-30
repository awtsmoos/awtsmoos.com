
import { AwtsmoosTheme } from './AwtsmoosTheme.js';

/**
 * B"H
 * @file MitzvahWorldLandingStyles.js
 * @description The garments of the Landing Screen.
 */
export const MitzvahWorldLandingStyles = {
    '.landing-container': {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: AwtsmoosTheme.colors.deepVoid,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: AwtsmoosTheme.fonts.primary,
        color: AwtsmoosTheme.colors.infiniteLight,
        overflow: 'hidden',
        zIndex: '9999',
        animation: 'revealFromNothing 2s ease-out forwards'
    },
    '.title-glow': {
        fontSize: '5rem',
        fontFamily: AwtsmoosTheme.fonts.title,
        letterSpacing: '5px',
        animation: 'textGlow 3s infinite',
        marginBottom: AwtsmoosTheme.spacing.large
    },
    '.loading-bar-vessel': {
        width: '60%',
        height: '20px',
        border: `2px solid ${AwtsmoosTheme.colors.tzimtzumBorder}`,
        borderRadius: '10px',
        padding: '2px',
        animation: 'pulseLight 4s infinite',
        marginBottom: AwtsmoosTheme.spacing.medium
    },
    '.loading-light': {
        height: '100%',
        backgroundColor: AwtsmoosTheme.colors.sefirahBlue,
        width: '0%',
        borderRadius: '5px',
        transition: 'width 0.5s ease-out'
    },
    '.status-text': {
        fontSize: '1.2rem',
        color: AwtsmoosTheme.colors.infiniteLight,
        marginTop: AwtsmoosTheme.spacing.medium,
        animation: 'floatVessel 6s infinite ease-in-out'
    },
    '.status-text-highlight': {
        color: AwtsmoosTheme.colors.sefirahGold,
        fontWeight: 'bold',
        marginTop: AwtsmoosTheme.spacing.small
    }
};
