
import { AwtsmoosTheme } from './AwtsmoosTheme.js';

/**
 * B"H
 * @file OrEinSofAnimationsData.js
 * @description The spiritual breath (Ruach) animating the UI.
 */
export const OrEinSofAnimationsData = {
    '@keyframes pulseLight': {
        '0%': { boxShadow: `0 0 10px ${AwtsmoosTheme.colors.sefirahBlue}` },
        '50%': { boxShadow: `0 0 40px ${AwtsmoosTheme.colors.sefirahBlue}` },
        '100%': { boxShadow: `0 0 10px ${AwtsmoosTheme.colors.sefirahBlue}` }
    },
    '@keyframes textGlow': {
        '0%': { textShadow: `0 0 5px ${AwtsmoosTheme.colors.sefirahGold}` },
        '50%': { textShadow: `0 0 20px ${AwtsmoosTheme.colors.sefirahGold}` },
        '100%': { textShadow: `0 0 5px ${AwtsmoosTheme.colors.sefirahGold}` }
    },
    '@keyframes floatVessel': {
        '0%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-15px)' },
        '100%': { transform: 'translateY(0px)' }
    },
    '@keyframes revealFromNothing': {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' }
    }
};
