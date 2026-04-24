
/**
 * B"H
 * @module titleBuilder
 * @description
 * "Let there be light," and the words "Mitzvah World" manifested.
 * Each letter is a conduit for the Divine Will, structured with layers of shadows 
 * and borders to remind us that the physical world conceals the true reality.
 * Yet, through the Mitzvahs performed within, the concealment becomes a revelation.
 */

/**
 * @function titleBuilder
 * @description Constructs the majestic title structure of the main menu.
 * @returns {Object} The JSON representation of the HTML hierarchy for the title.
 */
export default function titleBuilder() {
    return {
        className: "mainTitle",
        child: {
            className: "lns",
            children: "Mitzvah World".split(" ").map(w => ({
                className: "line",
                child: {
                    className: "borderWrap",
                    children: [
                        {
                            className: "txt",
                            textContent: w
                        },
                        {
                            className: "borderTxt",
                            textContent: w,
                            attributes: {
                                "data-text": w
                            }
                        }
                    ]
                }
            }))
        }
    };
}
