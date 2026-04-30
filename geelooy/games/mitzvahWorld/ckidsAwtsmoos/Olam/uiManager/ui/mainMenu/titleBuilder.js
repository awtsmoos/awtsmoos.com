
/**
 * @file titleBuilder.js
 * @description
 * THE EMBLEM OF REVELATION
 * 
 * Chapter 11: The Carving of the Name.
 * "And he called the name of the place Mitzvah World."
 * This module generates the nested structure required for the 
 * intense layered text effect. It creates two instances of every 
 * word: one for the white light, one for the black boundary.
 */

export default function titleBuilder() {
    const words = ["Mitzvah", "World"];

    return {
        className: "mainTitle",
        child: {
            className: "lns",
            children: words.map(word => ({
                className: "line",
                child: {
                    className: "borderWrap",
                    children: [
                        {
                            className: "txt",
                            textContent: word
                        },
                        {
                            className: "borderTxt",
                            textContent: word,
                            attributes: {
                                "data-text": word
                            }
                        }
                    ]
                }
            }))
        }
    };
}
