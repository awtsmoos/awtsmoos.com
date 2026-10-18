// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Atomic nginx deployment vessel for Awtsmoos.com.
 * @description
 * The Awtsmoos holds before and after in one truth; this installer keeps a full rollback near,
 * so Awtsmoos.com may reveal a new edge only after nginx declares the vessel clear.
 */

import { access, cp, mkdir, rename, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

async function pathExists(target) {
	try {
		await access(target);
		return true;
	} catch {
		return false;
	}
}

/** Installs one complete tracked vhost/snippet tree with validation and rollback. */
export class NginxAtomicDeployment {
	constructor(options) {
		Object.assign(this, options);
		this.hadMain = false;
		this.hadSnippets = false;
	}

	/** Deploys the complete tracked configuration and reloads nginx only after validation. */
	async deploy() {
		await this.backup();

		try {
			await this.installFiles();
			this.run("nginx", ["-t"]);
			this.run("systemctl", ["reload", "nginx"]);
		} catch (error) {
			await this.restore();
			this.run("nginx", ["-t"]);
			throw error;
		}
	}

	/** Preserves every pre-existing nginx vessel outside enabled include directories. */
	async backup() {
		this.hadMain = await pathExists(this.targetMain);
		this.hadSnippets = await pathExists(this.targetSnippets);
		await mkdir(this.backupRoot, { recursive: true });

		if (this.hadMain) {
			await cp(this.targetMain, `${this.backupRoot}/awtsmoos.com`);
		}

		if (this.hadSnippets) {
			await cp(this.targetSnippets, `${this.backupRoot}/awtsmoos.d`, { recursive: true });
		}
	}

	/** Replaces active files with the complete tracked configuration tree. */
	async installFiles() {
		const stagedMain = `${this.targetMain}.awtsmoos-next`;
		const stagedSnippets = `${this.targetSnippets}.awtsmoos-next`;
		await rm(stagedMain, { force: true });
		await rm(stagedSnippets, { force: true, recursive: true });
		await cp(this.sourceMain, stagedMain);
		await cp(this.sourceSnippets, stagedSnippets, { recursive: true });
		await rm(this.targetSnippets, { force: true, recursive: true });
		await rename(stagedSnippets, this.targetSnippets);
		await rename(stagedMain, this.targetMain);
	}

	/** Restores the exact pre-deployment presence or absence of active files. */
	async restore() {
		await rm(this.targetSnippets, { force: true, recursive: true });
		if (this.hadSnippets) {
			await cp(`${this.backupRoot}/awtsmoos.d`, this.targetSnippets, { recursive: true });
		}

		if (this.hadMain) {
			await cp(`${this.backupRoot}/awtsmoos.com`, this.targetMain);
		} else {
			await rm(this.targetMain, { force: true });
		}
	}

	/** Executes one required system command with inherited diagnostics. */
	run(command, args) {
		execFileSync(command, args, { stdio: "inherit" });
	}
}
