
import { AwtsmoosConstants } from '../themes/AwtsmoosConstants.js';

/**
 * B"H
 * @file RuachAnimationsData.js
 * @description
 * 💨 THE WIND / SPIRIT (RUACH) OF ALL THINGS 💨
 * 
 * Time itself must be continuously maintained from Nothing. Time manifests 
 * in our UI as `@keyframes`... fluid states of being that shift from Past 
 * to Present to Future dynamically, showing how objects "float", "glow", 
 * and express "divine breath" by expanding and shrinking bounds!
 */
export const RuachAnimationsData = {
    '@keyframes awakenFromVoid': {
        '0%': { opacity: '0', transform: 'scale(0.8) translateY(20px)', filter: 'blur(10px)' },
        '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' }
    },
    '@keyframes einSofGlow': {
        '0%': { boxShadow: `0 0 10px ${AwtsmoosConstants.colors.emeraldEinSof}, inset 0 0 5px ${AwtsmoosConstants.colors.sefirahGold}` },
        '50%': { boxShadow: `0 0 35px ${AwtsmoosConstants.colors.emeraldEinSof}, inset 0 0 15px ${AwtsmoosConstants.colors.sefirahGold}` },
        '100%': { boxShadow: `0 0 10px ${AwtsmoosConstants.colors.emeraldEinSof}, inset 0 0 5px ${AwtsmoosConstants.colors.sefirahGold}` }
    },
    '@keyframes crownGleamText': {
        '0%': { textShadow: `0 0 2px ${AwtsmoosConstants.colors.sefirahGold}` },
        '50%': { textShadow: `0 0 20px ${AwtsmoosConstants.colors.sefirahGold}, 0 0 30px ${AwtsmoosConstants.colors.keterWhite}` },
        '100%': { textShadow: `0 0 2px ${AwtsmoosConstants.colors.sefirahGold}` }
    },
    '@keyframes orbitLoaderBar': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' }
    }
};
