/*B"H*/

const { NO_LOGIN } = require("../../_awtsmoos.constants.js");
const { er } = require("../../general.js");

function methodIs($i, method) {
    return String($i?.request?.method || "").toUpperCase() === method;
}

function methodOnly($i, method) {
    if (methodIs($i, method)) return null;
    return er({ message: `${method} only request`, code: `${method}_ONLY` });
}

function body($i, method) {
    const key = `$_${String(method || $i?.request?.method || "POST").toUpperCase()}`;
    return $i?.[key] || {};
}

function getUserId($i, userid) {
    return userid || $i?.awtsmoosSession?.user?.id || $i?.moch?.userid || null;
}

function requireLogin($i, userid) {
    const id = getUserId($i, userid);
    return id ? { userid: id } : er(NO_LOGIN);
}

function requireFields(source, fields) {
    const missing = fields.filter(field => source?.[field] === undefined || source?.[field] === null || source?.[field] === "");
    return missing.length ? er({ message: `Missing required parameters: ${missing.join(", ")}`, code: "MISSING_PARAMS", missing }) : null;
}

module.exports = {
    er,
    methodIs,
    methodOnly,
    body,
    getUserId,
    requireLogin,
    requireFields
};
