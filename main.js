// Function to wrap any numbers followed by "g" in a span with the class 'bold-1'
function tagGrams(text) {
  return text.replace(/\b(\d+g)\b/g, '<span class="bold-1">$1</span>');
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. On button click, load the pad content as Markdown
  document.getElementById("atualizarButton").addEventListener("click", () => {
    let url = document.getElementById("padUrlInput").value.trim();
    if (url) {
      if (!url.endsWith("/export/txt")) {
        url = url.replace(/\/+$/, "");
        url += "/export/txt";
      }
      loadMarkdown(url);
    }
  });

  // 2. Fetch the Markdown and process it
  function loadMarkdown(url) {
    fetch(url)
      .then((response) => response.text())
      .then((markdown) => {
        processMarkdown(markdown);
      })
      .catch((error) => {
        console.error("Erro ao carregar o markdown:", error);
        document.getElementById("cards").innerHTML =
          "<p>Erro ao carregar o conteúdo.</p>";
      });
  }

  // 3. Convert Markdown to HTML and build the meal/dish structure
  function processMarkdown(md) {
    const converter = new showdown.Converter();
    const htmlContent = converter.makeHtml(md);
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;

    // Intro: Convert first blockquote to a plain paragraph
    const introSection = document.getElementById("intro");
    introSection.innerHTML = "";
    const blockquote = tempContainer.querySelector("blockquote");
    if (blockquote) {
      const p = document.createElement("p");
      p.innerHTML = blockquote.innerHTML;
      introSection.appendChild(p);
      blockquote.remove();
    }

    // Cards container
    const cardsSection = document.getElementById("cards");
    cardsSection.innerHTML = "";

    let mealCounter = 0;
    let currentMealSection = null;
    let dishCardsContainer = null;
    let currentDishCard = null;

    // Helper to create a meal header with arrow icon (static)
    function createMealHeader(titleText) {
      const mealHeader = document.createElement("div");
      mealHeader.className = "meal-header";

      const headerText = document.createElement("h2");
      headerText.innerHTML = titleText;
      mealHeader.appendChild(headerText);

      return mealHeader;
    }

    // Process each node from the converted markdown
    Array.from(tempContainer.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();

        // If we see an h2, start a new meal section
        if (tag === "h2") {
          mealCounter++;
          currentMealSection = document.createElement("div");
          currentMealSection.className = "meal-section"; // always expanded (no toggle class)
          currentMealSection.id = "meal-section-" + mealCounter;

          // Create the meal header
          const mealHeader = createMealHeader(node.innerHTML);
          currentMealSection.appendChild(mealHeader);

          // Create a container for the dish cards (always expanded)
          dishCardsContainer = document.createElement("div");
          dishCardsContainer.className = "dish-cards-container";
          // Leave max-height unset so it adapts naturally
          dishCardsContainer.style.maxHeight = "";
          currentMealSection.appendChild(dishCardsContainer);

          cardsSection.appendChild(currentMealSection);
          currentDishCard = null;

        // If we see an h3, that's a new dish card
        } else if (tag === "h3") {
          if (!dishCardsContainer) {
            // Create a default meal section if needed
            mealCounter++;
            currentMealSection = document.createElement("div");
            currentMealSection.className = "meal-section";
            currentMealSection.id = "meal-section-" + mealCounter;

            const mealHeader = createMealHeader("Refeição");
            currentMealSection.appendChild(mealHeader);

            dishCardsContainer = document.createElement("div");
            dishCardsContainer.className = "dish-cards-container";
            currentMealSection.appendChild(dishCardsContainer);
            cardsSection.appendChild(currentMealSection);
          }
          currentDishCard = document.createElement("div");
          currentDishCard.className = "dish-card";
          currentDishCard.appendChild(node);
          dishCardsContainer.appendChild(currentDishCard);

        } else {
          // Append other elements (paragraphs, lists, etc.) to the current dish card
          if (currentDishCard) {
            currentDishCard.appendChild(node);
          } else {
            // If there's no current dish card, create a default meal section
            if (!dishCardsContainer) {
              mealCounter++;
              currentMealSection = document.createElement("div");
              currentMealSection.className = "meal-section";
              currentMealSection.id = "meal-section-" + mealCounter;

              const mealHeader = createMealHeader("Refeição");
              currentMealSection.appendChild(mealHeader);

              dishCardsContainer = document.createElement("div");
              dishCardsContainer.className = "dish-cards-container";
              currentMealSection.appendChild(dishCardsContainer);
              cardsSection.appendChild(currentMealSection);
            }
            if (!currentDishCard) {
              currentDishCard = document.createElement("div");
              currentDishCard.className = "dish-card";
              dishCardsContainer.appendChild(currentDishCard);
            }
            currentDishCard.appendChild(node);
          }
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        // If we have stray text, add it to the current dish card
        if (currentDishCard) {
          currentDishCard.appendChild(node);
        }
      }
    });

    // After processing, tag any numbers followed by "g" in all dish cards
    document.querySelectorAll('.dish-card').forEach(card => {
      card.innerHTML = tagGrams(card.innerHTML);
    });
  }
});
