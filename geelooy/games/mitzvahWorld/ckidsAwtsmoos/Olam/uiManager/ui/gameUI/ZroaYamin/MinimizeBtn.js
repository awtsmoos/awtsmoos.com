
/**
 * B"H
 * @module MinimizeBtn
 * @description
 * THE CURTAIN OF CONTRACTION (TZIMTZUM)
 * 
 * "And He contracted His Light, and withdrew it to the sides..."
 * This vessel allows the soul to withdraw the Right Arm of Action 
 * when it is not needed, making room for the expanse of the world.
 */
export default {
    className: "minimize opened",
    style: {
        pointerEvents: "auto" // The switch must always be tangible.
    },
    onclick(e, $, ui, el) {
        console.log('B"H - ⚡ [TZIMTZUM]: Toggling the Right Arm contraction.');
        var bar = $("action bar") || document.getElementById("actionBar");
        if (!bar) return;
        bar.classList.toggle("minimized");
        el.classList.toggle("opened");
        el.classList.toggle("closed");
    }
};
