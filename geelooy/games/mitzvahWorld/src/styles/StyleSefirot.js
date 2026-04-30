
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
export const StyleSefirot = {
    ".awtsmoos-overlay": {
        "position": "fixed",
        "top": "0",
        "left": "0",
        "width": "100vw",
        "height": "100vh",
        "background": "radial-gradient(circle at center, #1b2735 0%, #090a0f 100%)",
        "z-index": "9999",
        "display": "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "font-family": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        "overflow": "hidden",
        "color": "#ffffff"
    },
    ".awtsmoos-particles": {
        "position": "absolute",
        "top": "0",
        "left": "0",
        "width": "100%",
        "height": "100%",
        "pointer-events": "none",
        "z-index": "1"
    },
    ".awtsmoos-title-container": {
        "z-index": "10",
        "text-align": "center",
        "margin-bottom": "4rem"
    },
    ".awtsmoos-main-title": {
        "font-size": "5rem",
        "font-weight": "800",
        "text-transform": "uppercase",
        "letter-spacing": "8px",
        "margin": "0",
        "background": "linear-gradient(to right, #fff, #a3d9ff)",
        "-webkit-background-clip": "text",
        "-webkit-text-fill-color": "transparent",
        "text-shadow": "0 0 20px rgba(163, 217, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)",
        "animation": "awtsmoosPulse 4s infinite alternate"
    },
    ".awtsmoos-sub-title": {
        "font-size": "1.2rem",
        "letter-spacing": "15px",
        "text-transform": "uppercase",
        "color": "#a3d9ff",
        "opacity": "0.8",
        "margin-top": "1rem"
    },
    ".awtsmoos-button-grid": {
        "display": "flex",
        "flex-direction": "column",
        "gap": "1.5rem",
        "z-index": "10",
        "width": "100%",
        "max-width": "400px"
    },
    ".awtsmoos-btn": {
        "background": "rgba(255, 255, 255, 0.03)",
        "border": "1px solid rgba(255, 255, 255, 0.1)",
        "padding": "1.2rem 2rem",
        "color": "#ffffff",
        "font-size": "1.1rem",
        "font-weight": "600",
        "letter-spacing": "2px",
        "border-radius": "16px",
        "cursor": "pointer",
        "backdrop-filter": "blur(12px)",
        "-webkit-backdrop-filter": "blur(12px)",
        "transition": "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "box-shadow": "0 4px 15px rgba(0, 0, 0, 0.3)",
        "position": "relative",
        "overflow": "hidden"
    },
    ".awtsmoos-btn:hover": {
        "background": "rgba(255, 255, 255, 0.1)",
        "border-color": "rgba(163, 217, 255, 0.5)",
        "transform": "translateY(-4px) scale(1.03)",
        "box-shadow": "0 10px 30px rgba(163, 217, 255, 0.2)"
    },
    ".awtsmoos-btn:active": {
        "transform": "translateY(0) scale(0.98)"
    },
    "@keyframes awtsmoosPulse": {
        "0%": { "filter": "drop-shadow(0 0 15px rgba(163, 217, 255, 0.4))" },
        "100%": { "filter": "drop-shadow(0 0 35px rgba(255, 255, 255, 0.8))" }
    }
};
