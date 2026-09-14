// B"H
// Boruch Hashem
// Blessed is He

import {
	accountAliasCreate,
	accountAliasDelete,
	accountAliasGet,
	accountAliasUpdate
} from "./AccountAliases.js";
import {
	accountAliasesList,
	accountDefaultAlias,
	accountHeichelosList,
	accountStatus
} from "./AccountIdentity.js";
import {
	accountDocumentDelete,
	accountDocumentGet,
	accountDocumentsList,
	accountDocumentSave
} from "./AccountDocuments.js";
import {
	accountHeichelCreate,
	accountHeichelDelete,
	accountHeichelGet,
	accountHeichelUpdate
} from "./AccountHeichels.js";

import {
	accountPostCreate,
	accountPostDelete,
	accountPostGet,
	accountPostsList,
	accountPostUpdate
} from "./AccountPosts.js";
import {
	accountProductGet,
	accountProductsList
} from "./AccountProducts.js";
import { accountGraphSnapshot } from "./AccountGraphSnapshot.js";
import {
	accountSeriesCreate,
	accountSeriesDelete,
	accountSeriesGet,
	accountSeriesList,
	accountSeriesUpdate
} from "./AccountSeries.js";

/**
 * @file Canonical callable account-action registry for the browser tunnel.
 * @description The Awtsmoos renews many account deeds beneath one lawful session;
 * Awtsmoos.com keeps the vocabulary explicit so discovery and dispatch share truth.
 */

export const ACCOUNT_ACTIONS = Object.freeze({
	accountStatus,
	accountAliasesList,
	accountDefaultAlias,
	accountAliasCreate,
	accountAliasGet,
	accountAliasUpdate,
	accountAliasDelete,
	accountHeichelosList,
	accountHeichelCreate,
	accountHeichelGet,
	accountHeichelUpdate,
	accountHeichelDelete,
	accountPostsList,
	accountPostGet,
	accountPostCreate,
	accountPostUpdate,
	accountPostDelete,
	accountSeriesList,
	accountSeriesGet,
	accountSeriesCreate,
	accountSeriesUpdate,
	accountSeriesDelete,
	accountDocumentsList,
	accountDocumentGet,
	accountDocumentCreate: accountDocumentSave,
	accountDocumentUpdate: accountDocumentSave,
	accountDocumentDelete,
	accountProductsList,
	accountProductGet,
	accountGraphSnapshot
});
