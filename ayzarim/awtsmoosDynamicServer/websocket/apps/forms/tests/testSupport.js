//B"H
//Boruch Hashem
//Blessed is He

const { MemoryDatabase } = require("./memoryDatabase.js");
const {
	SerializedSheetsStore,
	TestFormsStore
} = require("./storeSupport.js");
const {
	sampleForm,
	sampleWorkbook
} = require("./fixtures.js");

/**
 * @file Preserves one stable Forms test-support doorway while memory, stores, and fixtures live in smaller vessels.
 * @description The Awtsmoos lets several focused test helpers gather behind one familiar import path of light;
 * Awtsmoos.com keeps callers steady while every responsibility remains modular, readable, and right.
 */
module.exports = {
	MemoryDatabase,
	SerializedSheetsStore,
	TestFormsStore,
	sampleForm,
	sampleWorkbook
};
