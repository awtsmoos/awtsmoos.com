
/**
 * @constant StyleSefirot
 * @description
 * B"H
 * Here lies the data, pure and untamed,
 * The styles of the menu, divinely named.
 * No chaotic CSS strings to confuse and to bind,
 * But a JSON array, structured and kind.
 * The Awtsmoos shines through the gradient deep,
 * Waking the pixels from their dormant sleep.
 * 
 * This object maps CSS selectors to their property-value pairs,
 * entirely avoiding traditional CSS files to ensure everything
 * flows through the declarative JS chariot.
 * 
 * @type {Object<string, Object<string, string>>}
 */
import { AwtsmoosConstants } from '../ui/styles/themes/AwtsmoosConstants.js';

export const StyleSefirot = {
    ".awtsmoos-overlay": {
        "position": "fixed",
        "inset": "0",
        "background": `radial-gradient(circle at center, ${AwtsmoosConstants.colors.voidMidtone} 0%, ${AwtsmoosConstants.colors.tzimtzumAbyss} 100%)`,
        "z-index": "9999",
        "display": "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "font-family": AwtsmoosConstants.typology.ancientMono,
        "overflow-y": "auto",
        "overflow-x": "hidden",
        "color": AwtsmoosConstants.colors.keterWhite,
        "padding": "20px",
        "box-sizing": "border-box"
    },
    ".awtsmoos-particles": {
        "position": "absolute",
        "inset": "0",
        "pointer-events": "none",
        "z-index": "1",
        "opacity": "0.4",
        "background-image": "radial-gradient(#ffffff 1px, transparent 1px)",
        "background-size": "50px 50px"
    },
    ".awtsmoos-title-container": {
        "z-index": "10",
        "text-align": "center",
        "margin-bottom": "clamp(2rem, 8vh, 5rem)",
        "display": "flex",
        "flex-direction": "column",
        "align-items": "center"
    },
    ".awtsmoos-main-title": {
        "font-size": "clamp(3rem, 15vw, 7rem)",
        "font-family": AwtsmoosConstants.typology.epicTitles,
        "font-weight": "900",
        "text-transform": "uppercase",
        "letter-spacing": "clamp(4px, 2vw, 15px)",
        "margin": "0",
        "color": AwtsmoosConstants.colors.sefirahGold,
        "text-shadow": `0 0 20px ${AwtsmoosConstants.colors.sefirahGold}66, 0 0 40px ${AwtsmoosConstants.colors.sefirahGold}33`,
        "animation": "awtsmoosPulse 4s infinite alternate",
        "line-height": "1"
    },
    ".awtsmoos-sub-title": {
        "font-size": "clamp(1.5rem, 6vw, 3.5rem)",
        "letter-spacing": "clamp(5px, 1.5vw, 20px)",
        "text-transform": "uppercase",
        "color": AwtsmoosConstants.colors.keterWhite,
        "opacity": "0.9",
        "margin-top": "0.5rem",
        "font-weight": "300"
    },
    ".awtsmoos-button-grid": {
        "display": "flex",
        "flex-direction": "column",
        "gap": "1.5rem",
        "z-index": "10",
        "width": "100%",
        "max-width": "500px",
        "padding": "0 20px",
        "box-sizing": "border-box"
    },
    ".awtsmoos-btn": {
        "background": `linear-gradient(180deg, ${AwtsmoosConstants.colors.emeraldEinSof} 0%, ${AwtsmoosConstants.colors.emeraldShadow} 100%)`,
        "border": `2px solid ${AwtsmoosConstants.colors.emeraldEinSof}`,
        "padding": "clamp(1rem, 3vh, 1.5rem) 2rem",
        "color": AwtsmoosConstants.colors.tzimtzumAbyss,
        "font-size": "clamp(1rem, 4vw, 1.3rem)",
        "font-weight": "800",
        "letter-spacing": "2px",
        "border-radius": AwtsmoosConstants.metrics.radiusVessel,
        "cursor": "pointer",
        "transition": "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "box-shadow": "0 10px 20px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.5)",
        "position": "relative",
        "overflow": "hidden",
        "text-transform": "uppercase",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "min-height": "80px"
    },
    ".awtsmoos-btn::after": {
        "content": "''",
        "position": "absolute",
        "bottom": "10%",
        "left": "50%",
        "transform": "translateX(-50%)",
        "width": "60%",
        "height": "30%",
        "background": "rgba(255, 255, 255, 0.4)",
        "filter": "blur(8px)",
        "border-radius": "50%",
        "pointer-events": "none"
    },
    ".awtsmoos-btn:hover": {
        "transform": "translateY(-5px) scale(1.02)",
        "box-shadow": `0 15px 30px ${AwtsmoosConstants.colors.emeraldShadow}aa, inset 0 2px 10px rgba(255, 255, 255, 0.7)`,
        "filter": "brightness(1.1)"
    },
    ".awtsmoos-btn:active": {
        "transform": "translateY(2px) scale(0.98)",
        "box-shadow": "0 5px 10px rgba(0, 0, 0, 0.4)"
    },
    "@keyframes awtsmoosPulse": {
        "0%": { "transform": "scale(1)", "filter": "brightness(1)" },
        "100%": { "transform": "scale(1.05)", "filter": "brightness(1.2)" }
    },
    "@media (max-width: 600px)": {
        ".awtsmoos-title-container": {
            "margin-bottom": "2rem"
        },
        ".awtsmoos-btn": {
            "padding": "1rem",
            "min-height": "60px"
        }
    }
};
