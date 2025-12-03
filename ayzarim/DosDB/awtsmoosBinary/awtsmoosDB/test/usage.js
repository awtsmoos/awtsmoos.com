	// B"H
// Usage & Verification Script for AwtsmoosDB
// Demonstrates: Initialization, Massive Write, Pagination, and Random Access.

const AwtsmoosDB = require('../index.js');
const path = require('path');
const fs = require('fs');

async function runTest() {
	const dbPath = path.join(__dirname, 'test.awtsmoosDB');
	
	// Clean up previous test
	try { fs.unlinkSync(dbPath); } catch(e) {}
	
	console.log("B\"H\n - Starting AwtsmoosDB Test");
	console.log("--------------------------------");
	
	const db = new AwtsmoosDB(dbPath);
	await db.open();
	var chariot = {
            wheels: 4,
            driver: "Metatron",
            power: { type: "fire", intensity: 9000, cool: "Hello Awtsmoos" },
            angels: ["Gabriel", "Michael", "Raphael"],
         
        };
	await db.set("test_key", chariot );
	var val = await db.get("test_key");
	
	console.log("\n--- RESULT --- ", val );
}

runTest().catch(console.error);