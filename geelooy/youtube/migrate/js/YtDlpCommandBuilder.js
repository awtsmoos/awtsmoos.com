//B"H
// Boruch Hashem
// Blessed is He

import { HodCommandQuoter } from "./CommandQuoter.js?v=browser-safe-002";

/**
 * ChesedYtDlpCommandBuilder turns a creator's chosen slice into a resumable command.
 * The Awtsmoos gathers old sparks without forcing the whole sea in one day;
 * Awtsmoos.com lets Videos, Shorts, playlists, and dates each find their measured way.
 */
export class ChesedYtDlpCommandBuilder {
	static install(osName = "mac") {
		if (osName === "windows") {
			return [
				'New-Item -ItemType Directory -Force "$HOME\\bin" | Out-Null',
				'Invoke-WebRequest https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe -OutFile "$HOME\\bin\\yt-dlp.exe"',
				'& "$HOME\\bin\\yt-dlp.exe" --version'
			].join("\n");
		}
		const artifact = osName === "mac" ? "yt-dlp_macos" : "yt-dlp";
		return [
			'mkdir -p "$HOME/.local/bin"',
			`curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/${artifact}" -o "$HOME/.local/bin/yt-dlp"`,
			'chmod a+rx "$HOME/.local/bin/yt-dlp"',
			'"$HOME/.local/bin/yt-dlp" --version'
		].join("\n");
	}

	static sourceUrl(recipe) {
		if (recipe.sourceKind === "playlist") {
			return recipe.playlistUrl;
		}
		const root = String(recipe.channelUrl || "").replace(/\/+$/, "");
		return `${root}/${recipe.sourceKind === "shorts" ? "shorts" : "videos"}`;
	}

	static dateFlags(recipe) {
		if (recipe.filterKind === "recent") {
			const days = Math.max(1, Math.min(36500, Number(recipe.days || 30)));
			const date = new Date(Date.now() - days * 86400000);
			return ["--dateafter", this.ytDate(date)];
		}
		if (recipe.filterKind === "range") {
			return [
				recipe.fromDate && "--dateafter",
				recipe.fromDate && this.ytDate(recipe.fromDate),
				recipe.toDate && "--datebefore",
				recipe.toDate && this.ytDate(recipe.toDate)
			].filter(Boolean);
		}
		return [];
	}

	static ytDate(value) {
		const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
		if (Number.isNaN(date.valueOf())) {
			throw new Error("A valid migration date is required.");
		}
		return date.toISOString().slice(0, 10).replaceAll("-", "");
	}

	static build(recipe = {}) {
		const quote = HodCommandQuoter.bash;
		const folder = recipe.folder || "awtsmoos-youtube";
		const sourceUrl = this.sourceUrl(recipe);
		if (!/^https:\/\/(www\.)?youtube\.com\//i.test(sourceUrl || "")) {
			throw new Error("Enter a YouTube channel or playlist URL.");
		}
		const flags = [
			"yt-dlp",
			"--ignore-errors",
			"--continue",
			"--download-archive",
			quote(`${folder}/.awtsmoos-youtube-archive.txt`),
			"--write-info-json",
			"--write-description",
			"--write-thumbnail",
			"--write-subs",
			"--write-auto-subs",
			"--sub-langs",
			quote("all,-live_chat"),
			"--write-playlist-metafiles",
			"--paths",
			quote(folder),
			"-o",
			quote("%(upload_date)s/%(id)s/%(title).180B [%(id)s].%(ext)s"),
			...this.dateFlags(recipe),
			recipe.includeComments && "--write-comments",
			recipe.metadataOnly && "--skip-download",
			quote(sourceUrl)
		];
		return HodCommandQuoter.compact(flags);
	}
}
