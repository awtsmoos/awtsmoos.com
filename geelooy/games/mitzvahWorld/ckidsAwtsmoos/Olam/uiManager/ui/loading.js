
/**
 * B"H
 * The loading screen to display while the game components are loading.
 * Radial Design with Detailed Text and Error Handling.
 */

export default {
    shaym: "loading",
    className: "loading hidden",
    children: [
        {
            shaym: "loadingContent",
            className: "loadingContent",
            children: [
                {
                    className: "radial-loader-container",
                    children: [
                        {
                            shaym: "radial-progress",
                            className: "radial-progress",
                            children: [
                                { className: "radial-inner" },
                                { 
                                    className: "radial-text-container",
                                    children: [
                                        { tag: "span", className: "loading-aleph", textContent: "א" },
                                        { shaym: "loading-percent-text", className: "loading-percent", textContent: "0%" }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    className: "loading-info-container",
                    children: [
                        {
                            tag: "h2",
                            shaym: "action loading",
                            className: "loading-title",
                            textContent: "Initializing Olam..."
                        },
                        {
                            tag: "h4",
                            shaym: "sub action loading",
                            className: "loading-subtitle",
                            textContent: "Preparing Vessels"
                        }
                    ]
                }
            ]
        },
        // B"H: Error Modal
        {
            shaym: "loading-error-modal",
            className: "loading-error-modal hidden",
            children: [
                {
                    className: "error-content",
                    children: [
                        { tag: "h2", shaym: "error-title", textContent: "Critical Error" },
                        { tag: "p", shaym: "error-message", textContent: "Something went wrong." },
                        { tag: "pre", shaym: "error-details", textContent: "Details..." },
                        {
                            tag: "div",
                            className: "error-actions",
                            children: [
                                {
                                    tag: "button",
                                    textContent: "Dismiss & Continue",
                                    onclick(e, $, ui) {
                                        $("loading-error-modal").classList.add("hidden");
                                    }
                                },
                                {
                                    tag: "button",
                                    textContent: "Reload Page",
                                    onclick(e, $, ui) {
                                        location.reload();
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
