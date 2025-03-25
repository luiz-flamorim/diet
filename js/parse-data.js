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
		if (rawLine.trim() === "") continue;

		// Count tabs before any text
		const tabMatch = rawLine.match(/^(\t*)/);
		const tabCount = tabMatch ? tabMatch[1].length : 0;
		const line = rawLine.trim();

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
			const bulletItem = { text: bullet, children: [] };

			const target =
				currentDish !== null && typeof result[currentMain] === "object"
					? result[currentMain][currentDish]
					: result[currentMain];

			// Nesting logic
			if (!Array.isArray(target._stack)) target._stack = [];

			// Clean stack if current indent is less
			while (target._stack.length > tabCount) {
				target._stack.pop();
			}

			if (tabCount === 0) {
				target.push(bulletItem);
				target._stack = [bulletItem];
			} else {
				const parent = target._stack[tabCount - 1];
				if (parent) {
					parent.children.push(bulletItem);
					target._stack[tabCount] = bulletItem;
				}
			}
		} else {
			// Normal non-bullet text (optional: handle later)
			const target =
				currentDish !== null && typeof result[currentMain] === "object"
					? result[currentMain][currentDish]
					: result[currentMain];
			target.push(line);
		}
	}

	// Cleanup: remove _stack from all sections
	for (const section in result) {
		if (typeof result[section] === "object") {
			for (const dish in result[section]) {
				if (Array.isArray(result[section][dish])) {
					delete result[section][dish]._stack;
				}
			}
		} else if (Array.isArray(result[section])) {
			delete result[section]._stack;
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
