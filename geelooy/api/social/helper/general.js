/**
 * B"H
 * @file general.js
 * @chapter The Query Became A Focused Lens
 * @description
 * Shared social helpers. The property query may arrive as `propertyMap` from
 * old DosDB callers or as `properties` from newer route helpers. Both are
 * normalized into one parsed object before reaching AwtsmoosJSON readers, so the
 * API can request only the sparks it needs instead of pulling whole vessels.
 */

module.exports = {
    loggedIn,
    myOpts,
    er,
    generateAwtsmoosId,
    sortArray
};

function sortArray(ar) {
    return Array.from(ar).sort((a, b) => {
        const la = a?.toLowerCase?.();
        const lb = b?.toLowerCase?.();
        if (la < lb) return -1;
        if (la > lb) return 1;
        return 0;
    });
}

function parseMaybeJson(value) {
    if (!value || typeof value !== "string") return value || undefined;
    try { return JSON.parse(value); }
    catch { return value; }
}

function myOpts($i) {
    const maxOrech = $i.$_GET.maxOrech || $i.$_GET.maxLength;
    const meta = $i.$_GET.meta || $i.$_GET.stats;
    const propertyMap = parseMaybeJson($i.$_GET.propertyMap || $i.$_GET.properties);
    const arrayFilter = parseMaybeJson($i.$_GET.arrayFilter);
    const filterBy = parseMaybeJson($i.$_GET.filterBy);
    return {
        page: $i.$_GET.page || 1,
        pageSize: $i.$_GET.pageSize || 62,
        derech: $i.$_GET.derech,
        maxOrech,
        propertyMap,
        arrayFilter,
        filterBy,
        meta
    };
}

function loggedIn($i) {
    return Boolean($i?.request?.user?.loggedIn || $i?.request?.user?.info?.userId);
}

function er(m, details) {
    return {
        BH: "B\"H",
        error: m || "improper input of parameters",
        details
    };
}

async function generateAwtsmoosId({
    $i,
    nameVar,
    idVar,
    maxInputId = 26,
    maxNameLength = 50,
    existingPath
}) {
    let inputId = (typeof idVar === "string" && $i.$_POST[idVar]) || $i.$_POST.inputId || $i.$_POST.id;
    if (inputId === "undefined") inputId = undefined;
    const aliasName = (typeof nameVar === "string" && $i.$_POST[nameVar]) || $i.$_POST.title || $i.$_POST.name;
    const details = { POST: $i.$_POST, nameVar, idVar, existingPath, maxInputId, maxNameLength, aliasName, inputId };

    if (!inputId && !aliasName) return er({ message: "no parameters provided. Need either inputId or aliasName", code: "NO_PARAMS", given: $i.$_POST, nameVar });

    if (inputId) {
        if (inputId.length > maxInputId) return er({ message: `Invalid alias id length. Max: ${maxInputId} characters`, code: "INVALID_ID_LENGTH", proper: maxInputId });
        try {
            if (!$i.utils.verifyStrict({ inputString: inputId })) {
                return er({ message: "Invalid id. need to have only English letters or numbers, hebrew letters,  _ or $, and no spaces", proper: `a-zA-Z0-9_$;`, code: "INVALID_ID_FORMAT" });
            }
        } catch (e) {
            return er({ message: "Problem verifying id", code: "PROB_ID_VER", stack: e.stack, details });
        }
    }

    if (aliasName) {
        if (aliasName.length > maxNameLength) return er({ message: `Your alias name is too long (max: ${maxNameLength} char)`, code: "INV_NAME_LNGTH", proper: maxNameLength, details });
    } else {
        return er({ message: "No name to base ID off", code: "NO_NAME", details });
    }

    let aliasId;
    try { aliasId = inputId || $i.utils.generateId(aliasName, false, 0); }
    catch (e) { return er({ message: "Problem making the id", code: "PROBLEM_MAKING", detail: e + "" }); }

    if (aliasId === "undefined") aliasId = undefined;
    if (!aliasId) return er({ message: "Problem making the id", code: "NO_ID", details });

    try {
        if (typeof existingPath !== "string") return er({ message: "Must provide path to check if existing", code: "NO_EXISTING_PATH" });
        const existingAlias = await $i.db.get(`${existingPath}/${aliasId}`, myOpts($i));
        if (existingAlias) return er({ message: "That ID entry already exists", code: "ALREADY_EXISTS" });
    } catch (e) {
        return er({ message: "Problem searching", code: "PROB_SEARCH", id: aliasId + "", details: e.stack });
    }

    return { [idVar]: aliasId };
}
