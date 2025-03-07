/**
 * B"H
 * Allows u to open a "popup" showing some HTML.
 */
import UI from "./index.js"
export default ({
    url
}) => {
    var ui = new UI();
    ui.html({
        className: "awtsmoos-holder",
        children: [
            {
                tag: "iframe",
                src: url
            }
        ]
    });

}