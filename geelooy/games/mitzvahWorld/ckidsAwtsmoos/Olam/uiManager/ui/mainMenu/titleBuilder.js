
/**
 * B"H
 * @file titleBuilder.js
 * @description
 * THE RADIATING EMBLEM OF REVELATION
 */
export default function titleBuilder() {
    const words = ["Mitzvah", "World"];

    return {
        className: "mainTitle",
        children: words.map((word, i) => ({
            className: "title-word" + (i === 0 ? " gold" : ""),
            textContent: word.toUpperCase(),
            attributes: { "data-text": word.toUpperCase() }
        }))
    };
}

