// B"H
const MODE = Object.freeze({ END: 0, HTML: 1, CSS: 2, JS: 3, DOM: 4, NODE: 5, WORKER: 6 });
const HTML = Object.freeze({ NODE: 1, ATTR: 2, TEXT: 3, SERIES: 4 });
const CSS = Object.freeze({ RULE: 1, PROP: 2, END_RULE: 3, SERIES_RULE: 4 });
const SEL = Object.freeze({ TAG: 1, ID: 2, CLASS: 3, ATTR_EQ: 4, PSEUDO: 5, HAS: 6, GROUP: 7, END: 0 });
const JS = Object.freeze({ CLASS_CONST: 1, FIELD_CONST: 2, GEN: 3, LABEL: 4, TOTAL: 5, SUFFIX: 6, RENDER: 7 });
module.exports = { MODE, HTML, CSS, SEL, JS };
