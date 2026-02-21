const STORAGE_KEY = "shoppingList.v1";

// Default list (used only when there is no saved state or when you reset)
const defaultData = {
  "dairy-products": ["Butter", "Milk", "Cheese", "Yogurt"],
  "bakery-grains": ["Bread", "Pasta", "Rice"],
  "pantry-staples": ["Olive Oil", "Salt", "Sugar", "Flour", "Baking Powder", "Vinegar", "Canned Beans", "Canned Tomatoes", "Spices", "Condiments", "Baking Ingredients"],
  "breakfast": ["Coffee beans", "Tea", "Muesli", "Jam"],
  "personal-care": ["Toilet Paper", "Hand Soap", "Body Soap", "Shampoo", "Q-Tips", "Deodorant", "Toothpaste", "Toothbrush"],
  "cleaning-supplies": ["Laundry Detergent", "Dishwasher Tabs", "Cleaning Supplies", "Dish Soap", "Sponges", "Toilet flush freshener"],
  "household-items": ["Trash Bags", "Küchenrolle", "Aluminum Foil", "Backpapier"],
  "snacks": ["Almonds, walnuts…", "Snacks"],
  "fruits-vegetables": ["Avocadoes"],
  "others": ["Batteries"]
};

// Current state shape:
// {
//   "dairy-products": [{ text: "Butter", crossed: false }, ...],
//   ...
// }
let state = null;

function setStatus(msg) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = msg || "";
}

function toStateObject(dataObj) {
  const out = {};
  for (const [listId, items] of Object.entries(dataObj)) {
    out[listId] = items.map((t) => ({ text: t, crossed: false }));
  }
  return out;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state = toStateObject(defaultData);
    saveState();
    return;
  }

  try {
    state = JSON.parse(raw);
  } catch (e) {
    // If storage is corrupted, fall back to default
    state = toStateObject(defaultData);
    saveState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setStatus("Saved");
  // small status fade effect (optional)
  setTimeout(() => setStatus(""), 700);
}

function renderAll() {
  for (const listId of Object.keys(defaultData)) {
    renderList(listId);
  }
}

function renderList(listId) {
  const ul = document.getElementById(listId);
  if (!ul) return;

  ul.innerHTML = "";
  const items = state[listId] || [];

  items.forEach((item, index) => {
    const li = document.createElement("li");

    // Text
    const span = document.createElement("span");
    span.className = "item-text" + (item.crossed ? " crossed-out" : "");
    span.textContent = item.text;

    // Tap text to toggle (mobile friendly)
    span.addEventListener("click", () => {
      state[listId][index].crossed = !state[listId][index].crossed;
      saveState();
      renderList(listId);
    });

    // Cross out button (optional but kept)
    const crossBtn = document.createElement("button");
    crossBtn.type = "button";
    crossBtn.textContent = "Cross out";
    crossBtn.classList.add("cross-out-btn");
    crossBtn.addEventListener("click", () => {
      state[listId][index].crossed = !state[listId][index].crossed;
      saveState();
      renderList(listId);
    });

    // Delete button (handy for one-off items)
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
      state[listId].splice(index, 1);
      saveState();
      renderList(listId);
    });

    li.appendChild(span);
    li.appendChild(crossBtn);
    li.appendChild(delBtn);

    ul.appendChild(li);
  });
}

function addItem(listId, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!state[listId]) state[listId] = [];
  state[listId].push({ text, crossed: false });

  input.value = "";
  saveState();
  renderList(listId);
}

function wireAddButtons() {
  document.querySelectorAll("button[data-list][data-input]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addItem(btn.dataset.list, btn.dataset.input);
    });
  });
}

function wireEnterToAdd() {
  // For each add-row input, map it to its matching button via data-input
  document.querySelectorAll(".add-row input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        // find the button in same add-row
        const row = input.closest(".add-row");
        const btn = row ? row.querySelector("button[data-list][data-input]") : null;
        if (!btn) return;
        addItem(btn.dataset.list, btn.dataset.input);
      }
    });
  });
}

function wireReset() {
  const resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    const ok = confirm("Reset the whole list to default? This will remove added items and uncross everything.");
    if (!ok) return;

    state = toStateObject(defaultData);
    saveState();
    renderAll();
  });
}

function wireUncrossAll() {
  const btn = document.getElementById("uncross-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    for (const listId of Object.keys(state)) {
      state[listId] = (state[listId] || []).map((it) => ({ ...it, crossed: false }));
    }
    saveState();
    renderAll();
  });
}

// PWA: register service worker
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      // optional status
      // setStatus("Offline ready");
    } catch (e) {
      // If it fails, the app still works online
      // console.warn("SW registration failed", e);
    }
  });
}

// Init
loadState();
wireAddButtons();
wireEnterToAdd();
wireReset();
wireUncrossAll();
renderAll();
registerServiceWorker();
