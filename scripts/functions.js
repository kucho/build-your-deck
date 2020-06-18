const MAX_CARDS_PER_DECK = 3;

let CARD_STORE = {};
let LANG = "enUS";

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

function updateClassesPicker(classes) {
  const select = document.querySelector("#select-class");
  classes.forEach((el) => {
    const opt = document.createElement("option");
    console.log(el.capitalize());
    opt.textContent = el.capitalize();
    opt.value = el;
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

async function updateStore(lang) {
  const cards = await getAllCards(lang);
  for (const card of cards) {
    card[
      "image_url"
    ] = `https://art.hearthstonejson.com/v1/render/latest/${LANG}/256x/${card.id}.png`;
    card[
      "tile_url"
    ] = `https://art.hearthstonejson.com/v1/tiles/${card.id}.jpg`;
  }
  CARD_STORE = groupBy(cards, "cardClass");
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
  document
    .querySelectorAll(".card")
    .forEach((card) => card.parentNode.removeChild(card));
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
    if (parseInt(same.dataset.count) === MAX_CARDS_PER_DECK) {
      alert("You can't add more of this!");
      return false;
    }
    same.dataset.count = (parseInt(same.dataset.count) + 1).toString();
    const counter = same.lastChild;
    counter.textContent = same.dataset.count;
  } else {
    createCardInDeck(card);
  }
}

function createCardInDeck(card) {
  const cardTileWrapper = document.createElement("div");
  cardTileWrapper.classList.add("tile-wrapper");

  const tileRow = document.createElement("div");
  tileRow.classList.add("tile");
  tileRow.dataset.cardId = card.id;
  tileRow.dataset.count = "1";

  const tileCost = document.createElement("span");
  tileCost.textContent = card.cost;
  tileCost.classList.add("tile__cost");

  const tileName = document.createElement("span");
  tileName.textContent = card.name;
  tileName.classList.add("tile__title");

  const tileFill = document.createElement("div");
  tileFill.classList.add("tile__fill");

  const tileImg = document.createElement("div");
  tileImg.classList.add("tile__image");
  tileImg.setAttribute("style", `background-image: url("${card.tile_url}")`);

  const tileImgMask = document.createElement("div");
  tileImgMask.classList.add("tile__image--mask");

  const tileCounter = document.createElement("span");
  tileCounter.textContent = "1";
  tileCounter.classList.add("tile__counter");

  tileRow.append(tileCost);
  tileRow.append(tileName);
  tileRow.append(tileFill);
  tileRow.append(tileImg);
  tileRow.append(tileImgMask);
  tileRow.append(tileCounter);
  cardTileWrapper.append(tileRow);
  document.querySelector(".deck-list").append(cardTileWrapper);
}

function init() {
  const select = document.querySelector("#select-class");
  select.addEventListener("change", function () {
    cleanBoard();
    let cards = paginateCards(CARD_STORE[this.value], 9, 1);
    showCards(cards);
  });
}

updateStore(LANG).then(() => {
  console.log("Store updated!");
  updateClassesPicker(Object.keys(CARD_STORE));
});

window.onload = () => init();
