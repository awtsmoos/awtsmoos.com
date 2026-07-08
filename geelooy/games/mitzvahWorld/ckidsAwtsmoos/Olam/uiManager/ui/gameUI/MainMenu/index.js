/**
 * B"H
 * @module MainMenu
 * @description
 * THE HUB OF ALL PATHWAYS
 * 
 * This is the refined, premium version of the game menu.
 */
import Styles from "./Styles.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import menuItems from "../../../gameMenu.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const MainMenu = {
    shaym: "menu",
    className: "gameMenu offscreen",
    awtsmoosClick: true,
    children: [
        { tag: "style", textContent: Styles },
        {
            className: "main-menu-overlay",
            children: [
                {
                    className: "main-menu-content",
                    children: [
                        {
                            className: "main-menu-header",
                            children: [
                                { tag: "h1", textContent: "MITZVAH WORLD" },
                                { className: "menu-subtitle", textContent: "THE ETERNAL JOURNEY" }
                            ]
                        },
                        {
                            className: "menu-items-container",
                            children: menuItems.map(item => ({
                                tag: "button",
                                className: "main-menu-btn",
                                children: [
                                    { className: "btn-glow" },
                                    { className: "btn-text", textContent: item.text.toUpperCase() }
                                ],
                                onclick(e, $, ui, me) {
                                    me?.blur();
                                    const show = item.show;
                                    if (!show) return;

                                    const m = $("menu");
                                    if (!m) return;

                                    if (show === "menu") {
                                        m.classList.toggle("offscreen");
                                        m.classList.toggle("onscreen");
                                        return;
                                    }

                                    const el = $(show);
                                    if (!el) return;

                                    m.classList.add("offscreen");
                                    m.classList.remove("onscreen");
                                    
                                    // B"H: Toggle hidden class for other screens
                                    el.classList.toggle(item.showClass || "hidden");
                                    el.dispatchEvent(new CustomEvent("awtsmoosRevealed"));
                                }
                            }))
                        }
                    ]
                }
            ]
        }
    ]
};
