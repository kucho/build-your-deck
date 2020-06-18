const HEADERS = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "omgvamp-hearthstone-v1.p.rapidapi.com",
    "x-rapidapi-key": "0a9e2655femsh7c424f04a0b3378p163931jsn4bb6f27395ac",
  },
};

const MAX_CARDS_PER_DECK = 3;

let CARD_STORE = {};
let LANG = "enUS";

async function getInfo() {
  try {
    const response = await fetch(
      "https://omgvamp-hearthstone-v1.p.rapidapi.com/info",
      HEADERS
    );
    return response.json();
  } catch (err) {
    console.log(err);
  }
}

function updateClassesPicker(classes) {
  const select = document.querySelector("#select-class");
  classes.forEach((el) => {
    const opt = document.createElement("option");
    opt.textContent = el;
    opt.value = el.toUpperCase();
    select.append(opt);
  });
}

function groupBy(arr, criteria) {
  return arr.reduce(function (obj, item) {
    // If the criteria is a function, run it. Otherwise use the item property
    const key =
      typeof criteria === "function" ? criteria(item) : item[criteria];
    // If the key doesn't exist yet, create it
    if (!obj.hasOwnProperty(key)) {
      obj[key] = [];
    }
    // Push the value to the object
    obj[key].push(item);
    // Return the object to the next item in the loop
    return obj;
  }, {});
}

async function updateStore() {
  console.log(`Fetching cards...`);
  const cards = await getAllCards();
  // Insert image links to objects
  cards.forEach((card) => {
    card[
      "image_url"
    ] = `https://art.hearthstonejson.com/v1/render/latest/${LANG}/256x/${card.id}.png`;
    card[
      "tile_url"
    ] = `https://art.hearthstonejson.com/v1/tiles/${card.id}.jpg`;
  });
  CARD_STORE = groupBy(cards, "cardClass");
  console.log("Got it, boss!");
}

async function getAllCards(lang = "enUS") {
  try {
    const response = await fetch(
      `https://api.hearthstonejson.com/v1/latest/${lang}/cards.collectible.json`
    );
    return response.json();
  } catch (err) {
    console.log(err);
  }
}

function paginateCards(arr, page_size, page_number) {
  return arr.slice((page_number - 1) * page_size, page_number * page_size);
}

function cleanBoard() {
  document.querySelector(".cards").innerHTML = "";
}

function showCards(cards) {
  const board = document.querySelector(".cards");
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    const image = document.createElement("img");
    image.setAttribute("src", card.image_url);
    image.addEventListener("click", () => {
      addCardToDeck(card);
    });
    cardDiv.append(image);
    board.append(cardDiv);
  });
}

function addCardToDeck(card) {
  console.log(card);
  const same = document.querySelector(`[data-card-id=${card.id}]`);
  console.log(same);
  if (same) {
    if (same.dataset.count == MAX_CARDS_PER_DECK) {
      alert("You can't add more of this!");
      return false;
    }
    same.dataset.count = parseInt(same.dataset.count) + 1;
    const counter = same.parentNode.lastChild;
    counter.textContent = same.dataset.count;
    counter.classList.add("inline");
  } else {
    createCardInDeck(card);
  }
}

function createCardInDeck(card) {
  const cardTileWrapper = document.createElement("div");
  cardTileWrapper.classList.add("tile-wrapper");

  const cardTile = document.createElement("div");
  cardTile.classList.add("tile");
  cardTile.setAttribute(
    "style",
    `background-image: url('${card.tile_url}');
       background-size: contain;
       background-repeat: no-repeat;
       background-position: right;
      `
  );
  cardTile.dataset.cardId = card.id;
  cardTile.dataset.count = 1;
  const manaCost = document.createElement("div");
  manaCost.textContent = card.cost;
  manaCost.classList.add("mana-cost");

  const cardTitle = document.createElement("p");
  cardTitle.textContent = card.name;
  cardTitle.classList.add("card__title");

  const cardCounter = document.createElement("p");
  cardCounter.textContent = 1;
  cardCounter.classList.add("card__counter");

  cardTile.append(manaCost);
  cardTile.append(cardTitle);
  cardTileWrapper.append(cardTile);
  cardTileWrapper.append(cardCounter);
  document.querySelector(".deck").append(cardTileWrapper);
}

function init() {
  updateStore().then(console.log);
  getInfo().then((data) => updateClassesPicker(data.classes));
  const select = document.querySelector("#select-class");
  select.addEventListener("change", function () {
    cleanBoard();
    let cards = paginateCards(CARD_STORE[this.value], 9, 1);
    showCards(cards);
  });
}

window.onload = () => init();
