
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
        children: words.map(word => ({
            className: "title-word",
            textContent: word.toUpperCase(),
            attributes: { "data-text": word.toUpperCase() }
        }))
    };
}

