
/**
 * B"H
 * @file loading.js
 * @description
 * 🌀 THE VORTEX OF EMANATION (LOADING SCREEN) 🌀
 */

export default {
    shaym: "loading",
    className: "loading hidden", // B"H: Ensured 'hidden' is applied!
    children: [
        {
            className: "kabbalah-vortex",
            children:[
                { className: "sefirot-ring ring-1" },
                { className: "sefirot-ring ring-2" },
                { className: "sefirot-ring ring-3" },
                { className: "sefirot-ring ring-4" },
                { className: "sefirot-ring ring-5" }
            ]
        },
        {
            shaym: "loadingContent",
            className: "loadingContent",
            children:[
                {
                    shaym: "main loading area",
                    className: "mainLoadingArea",
                    children:[
                        {
                            tag: "h1",
                            className: "awtsmoos-title-glow glitch-effect",
                            textContent: "MITZVAH WORLD",
                            attributes: { "data-text": "MITZVAH WORLD" }
                        },
                        {
                            className: "barLoading",
                            children:[
                                {
                                    shaym: "bar background",
                                    className: "bck",
                                    child: {
                                        shaym: "loading bar",
                                        id: "genesisProgressBar", // Sacred ID for updating progress natively
                                        className: "barMitzvah",
                                        child: { className: "light-spark-comet" }
                                    }
                                }
                            ]
                        },
                        {
                            tag: "h2",
                            className: "txtLoad pulse-text",
                            innerHTML: "Drawing Down the Infinite Light..."
                        }
                    ]
                },
                {
                    className: "secondaryLoadingArea",
                    children:[
                        {
                            tag: "h3",
                            className: "txtLoad info",
                            innerHTML: "Forging Vessels...",
                            shaym: "action loading",
                            id: "genesisActionText"
                        }
                    ]
                }
            ]
        }
    ]
};
