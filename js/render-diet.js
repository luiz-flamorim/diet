// render-diet.js
import { fetchAndParsePad } from "./parse-data.js";

document.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("atualizarButton")
		.addEventListener("click", async () => {
			const padUrl = document.getElementById("padUrlInput").value.trim();
			if (!padUrl) {
				console.error("Please enter a pad URL.");
				return;
			}

			try {
				const data = await fetchAndParsePad(padUrl);
				console.log("Parsed data:", data);
				// 🔽 Call your own render logic here
				renderDiet(data);
			} catch (err) {
				console.error("Error parsing diet:", err);
			}
		});
});

function renderDiet(data) {
	const tabsContainer = document.getElementById("tabs");
	const cardsContainer = document.getElementById("cards");

	tabsContainer.innerHTML = "";
	cardsContainer.innerHTML = "";

	const sectionNames = Object.keys(data);

	sectionNames.forEach((sectionName, index) => {
		const tab = document.createElement("button");
		tab.className = "tab";
		tab.textContent = sectionName;
		if (index === 0) tab.classList.add("active"); // set first as active

		tab.addEventListener("click", () => {
			// deactivate all tabs
			document
				.querySelectorAll(".tab")
				.forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
			renderSection(sectionName, data[sectionName]);
		});

		tabsContainer.appendChild(tab);
	});

	// render first section by default
	renderSection(sectionNames[0], data[sectionNames[0]]);
}

function renderSection(title, value) {
  const container = document.getElementById("cards");
  container.innerHTML = '';

  const mealSection = document.createElement('div');
  mealSection.className = 'meal-section';

  const header = document.createElement('h2');
  header.className = 'meal-header';
  header.textContent = title;
  mealSection.appendChild(header);

  const dishCardsContainer = document.createElement('div');
  dishCardsContainer.className = 'dish-cards-container';

  if (typeof value === 'object' && !Array.isArray(value)) {
    for (const [dishName, items] of Object.entries(value)) {
      const dishCard = document.createElement('div');
      dishCard.className = 'dish-card';

      const h3 = document.createElement('h3');
      h3.textContent = dishName;
      dishCard.appendChild(h3);

      const ul = document.createElement('ul');

      items.forEach(entry => {
        if (typeof entry === 'string') {
          const li = document.createElement('li');
          li.innerHTML = tagGrams(entry);
          ul.appendChild(li);
        } else if (typeof entry === 'object') {
          const key = Object.keys(entry)[0];
          const li = document.createElement('li');
          li.innerHTML = `<strong>${key}</strong>`;
          const nestedUl = document.createElement('ul');
          entry[key].forEach(subItem => {
            const subLi = document.createElement('li');
            subLi.innerHTML = tagGrams(subItem);
            nestedUl.appendChild(subLi);
          });
          li.appendChild(nestedUl);
          ul.appendChild(li);
        }
      });

      dishCard.appendChild(ul);
      dishCardsContainer.appendChild(dishCard);
    }
  }

  if (Array.isArray(value)) {
    const card = document.createElement('div');
    card.className = 'dish-card';

    const ul = document.createElement('ul');
    value.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = tagGrams(item);
      ul.appendChild(li);
    });

    card.appendChild(ul);
    dishCardsContainer.appendChild(card);
  }

  mealSection.appendChild(dishCardsContainer);
  container.appendChild(mealSection);
}


function tagGrams(text) {
	return text.replace(/\b(\d+g)\b/g, '<span class="bold-1">$1</span>');
}
