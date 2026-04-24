
/**
 * B"H
 * The intense Kabbalistic loading screen for Mitzvah World.
 */

export default {
    shaym: "loading",
    className: "loading hidden",
    children: [
        {
            className: "kabbalah-vortex",
            children: [
                { className: "sefirot-ring ring-1" },
                { className: "sefirot-ring ring-2" },
                { className: "sefirot-ring ring-3" }
            ]
        },
        {
            shaym: "loadingContent",
            className: "loadingContent",
            children: [
                {
                    shaym: "main loading area",
                    className: "mainLoadingArea",
                    children: [
                        {
                            tag: "h1",
                            className: "awtsmoos-title-glow",
                            textContent: "MITZVAH WORLD"
                        },
                        {
                            className: "barLoading",
                            children: [
                                {
                                    shaym: "bar background",
                                    className: "bck",
                                    child: {
                                        shaym: "loading bar",
                                        className: "barMitzvah",
                                        child: { className: "light-spark" }
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
                    children: [
                        {
                            tag: "h3",
                            className: "txtLoad info",
                            innerHTML: "Preparing Vessels...",
                            shaym: "action loading"
                        },
                        {
                            tag: "h4",
                            className: "txtLoad info secondary",
                            innerHTML: "",
                            shaym: "sub action loading"
                        }
                    ]
                }
            ]
        }
    ]
};
