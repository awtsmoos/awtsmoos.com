//B"H
//Boruch Hashem
//Blessed be He

const MAGIC = "MWB4";
const VERSION = 2;

const OP = Object.freeze({
	END: 0,
	CREATE_NODE: 1,
	SET_ATTR: 2,
	SET_STYLE: 3,
	BIND_TEXT_EVENT: 4,
	SET_STYLE_HANDLE: 5
});

const OP_NAME = Object.freeze(
	Object.fromEntries(
		Object.entries(OP).map(([name, code]) => [code, name])
	)
);

module.exports = { MAGIC, OP, OP_NAME, VERSION };
