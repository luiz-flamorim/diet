// parse-data.js

function normalizePadUrl(url) {
	if (!url.endsWith("/export/txt")) {
		url = url.replace(/\/+$/, "");
		url += "/export/txt";
	}
	return url;
}

function parseMarkdownToJSON(text) {
	const lines = text.split("\n");
	const result = {};
	let currentMain = null;
	let currentDish = null;

	for (let rawLine of lines) {
		const line = rawLine.trim();
		if (line === "") continue;

		if (line.startsWith("## ")) {
			currentMain = line.substring(3).trim();
			currentDish = null;
			result[currentMain] = [];
		} else if (line.startsWith("### ")) {
			if (!currentMain) continue;
			if (Array.isArray(result[currentMain])) {
				result[currentMain] = {};
			}
			currentDish = line.substring(4).trim();
			result[currentMain][currentDish] = [];
		} else if (line.startsWith("-")) {
			const bullet = line.substring(1).trim();
			if (currentMain) {
				if (currentDish !== null && typeof result[currentMain] === "object") {
					result[currentMain][currentDish].push(bullet);
				} else {
					result[currentMain].push(bullet);
				}
			}
		} else {
			if (currentMain) {
				if (currentDish !== null && typeof result[currentMain] === "object") {
					result[currentMain][currentDish].push(line);
				} else {
					result[currentMain].push(line);
				}
			}
		}
	}

	return result;
}

export async function fetchAndParsePad(padUrl) {
	const normalizedUrl = normalizePadUrl(padUrl);
	const response = await fetch(normalizedUrl);
	if (!response.ok) {
		throw new Error("Failed to fetch pad content.");
	}
	const text = await response.text();
	return parseMarkdownToJSON(text);
}
