
/**
 * B"H
 * @module Stage5UI
 * @description
 * Generates the physical interface through which the soul perceives the Olam.
 * Uses `ayshPeula("htmlCreate")` allowing the Worker to safely command the Main Thread 
 * without shattering against the `document` barrier!
 */
export default class Stage5UI {
    static async build(olam, info) {
        if (info.html) {
            // B"H: silent

            
            const style = {
                tag: "style",
                innerHTML: `
                    .ikarGameMenu {
                        overflow: hidden;
                        position: absolute;
                        transform-origin: top left;
                        bottom: 0;
                        right: 0;
                        top: 0;
                        left: 0;
                    }
                    .gameUi > div {
                        position: absolute;
                    }
                `
            };

            const par = {
                shaym: "ikarGameMenu",
                parent: "main av",
                children: [
                    info.html,
                    style
                ],
                className: "ikarGameMenu"
            };

            // B"H: This is perfectly safe in the Worker! It sends a message.
            await olam.ayshPeula("htmlCreate", par);
            
            olam.htmlUI = par;
            olam.styled = true;
            // B"H: silent

        }
    }
}
