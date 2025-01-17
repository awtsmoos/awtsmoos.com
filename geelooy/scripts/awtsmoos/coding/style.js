//B"H
export default /*css*/`
.editorParent {
      overflow: scroll;
height:100%;
  line-height:${lineHeight}px;
}
.html-bracket {
        color: green;
}
    .html-tag {
        color: #ac009a;
}
    .html-attribute {
        color: brown;
}
    .html-attributeValue {
        color: #2300ff;
}
    .comment {
        color: orange;
}
    .css-selector {
        color: blue;
}
    .css-delimiter {
        color: purple;
}
    .css-property {
        color: brown;
}
    .css-propertyValue {
        color: red;
}
    .css-important {
        color: red;
        font-weight: bold;
}
    .javascript {
        color: black;
}
    .javascript-string {
        color: blue;
}
    .javascript-keyword {
        color: green;
}
    .javascript-number {
        color: red;
}
    .javascript-property {
        color: purple;
}
.colorCode, .code {
    min-height:100%;
    padding: 10px;
    outline: none;
    white-space:pre;
    font-family: monospace;
        tab-size:4;
    font-size: 15px;
    caret-color: black;

        line-height:20px;
}
.colorCode {
    user-select: none;
}

.awtsmoos-tab {
display:inline-block;
  font-size:2em;
    width: 36px;
}
`;