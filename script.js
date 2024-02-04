const searchInput = document.getElementById("search_input");
const clearSearchButton = document.querySelector(".clearSearchButton");
const welcomeText = document.querySelector(".welcome_text");
const loader = document.querySelector(".loading");
const resultArea = document.querySelector(".result_bar");
const meaningsBar = document.querySelector(".meanings_bar");
const wordDisplay = document.getElementById("word");
const phoneticsBar = document.querySelector(".phonetics_bar");

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    let word = e.target.value.split(/\s+/g).join(" ");
    if (word?.length > 0) {
      clearSearchButton.classList.remove("hidden");
      welcomeText.classList.add("hidden");
      findMeaning(word);
    }
  }
});

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  welcomeText.classList.remove("hidden");
  resultArea.classList.add("hidden");
  clearSearchButton.classList.add("hidden");
});

const findMeaning = async (word) => {
  resultArea.classList.add("hidden");
  loader.classList.remove("hidden");
  const result = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
  )
    .then((res) => res.json())
    .then((data) => data[0]);

  console.log(result);

  wordDisplay.textContent = word;
  meaningsBar.innerHTML = "";
  phoneticsBar.innerHTML = "";

  if (!result) {
    console.log("404");
    meaningsBar.innerHTML = "No definitions found.";
    resultArea.classList.remove("hidden");
    loader.classList.add("hidden");
    return;
  }

  result.phonetics.map((phonetic) => {
    const phoneticButton = document.createElement("button");
    if (phonetic.audio.length > 0) {
      phoneticButton.innerHTML = phonetic?.text
        ? phonetic?.text + " " + '<i class="fa-solid fa-volume-high"></i>'
        : '<i class="fa-solid fa-volume-high"></i>';
      phoneticButton.onclick = () => {
        let audio = new Audio(phonetic?.audio);
        audio.play();
      };
      phoneticsBar.appendChild(phoneticButton);
    } else if (phonetic.text) {
      phoneticButton.disabled = true;
      phoneticButton.innerHTML = phonetic.text;
      phoneticsBar.appendChild(phoneticButton);
    } else {
      return;
    }
  });

  result?.meanings?.map((meaning) => {
    const meaningCard = document.createElement("div");
    meaningCard.classList.add("meaning_card");

    const partOfSpeech = document.createElement("span");
    partOfSpeech.classList.add("partOfSpeech");
    partOfSpeech.textContent = meaning?.partOfSpeech || "Not found";
    meaningCard.appendChild(partOfSpeech);

    const definitions = document.createElement("div");
    definitions.classList.add("definitions");
    meaning?.definitions?.splice(0, 3)?.map((definition) => {
      const definitionDiv = document.createElement("div");
      definitionDiv.classList.add("definition");
      const definedMeaning = document.createElement("p");
      definedMeaning.textContent = definition?.definition;
      definitionDiv.appendChild(definedMeaning);
      if (definition.example) {
        const example = document.createElement("p");
        example.textContent = "Example: " + definition?.example;
        definitionDiv.appendChild(example);
      }
      definitions.appendChild(definitionDiv);
    });

    meaningCard.appendChild(definitions);
    meaningsBar.appendChild(meaningCard);

    if (meaning.synonyms.length > 0) {
      const synonyms = document.createElement("p");
      synonyms.classList.add("synonyms");
      synonyms.innerHTML =
        "Synonyms:" +
        meaning?.synonyms?.map(
          (synonym) =>
            ` <button onClick="handleClickSearch('${synonym}')">${synonym}</button>`
        );
      meaningsBar.appendChild(synonyms);
    }
  });

  resultArea.classList.remove("hidden");
  loader.classList.add("hidden");
};

const handleClickSearch = (word) => {
  if (word.split(/\s+/g).join(" ")?.length > 0) {
    searchInput.value = word.split(/\s+/g).join(" ");
    findMeaning(word.split(/\s+/g).join(" "));
  }
};
