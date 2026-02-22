// Versioned storage keys (so we can evolve without breaking old data)
const STORAGE_PREFIX = "shoppingList.v2";
const STATE_KEY = `${STORAGE_PREFIX}.state`;
const TEMPLATE_KEY = `${STORAGE_PREFIX}.template`;

// Factory default (shipped with the website). This is only used to initialize a local template.
const factoryDefaultTemplate = {
  "dairy-products": ["Butter", "Milk", "Cheese", "Yogurt"],
  "bakery-grains": ["Bread", "Pasta", "Rice"],
  "pantry-staples": [
    "Olive Oil", "Salt", "Sugar", "Flour", "Baking Powder", "Vinegar",
    "Canned Beans", "Canned Tomatoes", "Spices", "Condiments", "Baking Ingredients"
  ],
  "breakfast": ["Coffee beans", "Tea", "Muesli", "Jam"],
  "personal-care": ["Toilet Paper", "Hand Soap", "Body Soap", "Shampoo", "Q-Tips", "Deodorant", "Toothpaste", "Toothbrush"],
  "cleaning-supplies": ["Laundry Detergent", "Dishwasher Tabs", "Cleaning Supplies", "Dish Soap", "Sponges", "Toilet flush freshener"],
  "household-items": ["Trash Bags", "Küchenrolle", "Aluminum Foil", "Backpapier"],
  "snacks": ["Almonds, walnuts…", "Snacks"],
  "fruits-vegetables": ["Avocadoes"],
  "others": ["Batteries"]
};

// We keep category order stable using the factory list of keys
const CATEGORY_IDS = Object.keys(factoryDefaultTemplate);

// Local editable default list (template) and current list (state)
let template = null;
// state shape: { "dairy-products": [{text, crossed}, ...], ... }
let state = null;

function setStatus(msg) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = msg || "";
}

function normalizeText(s) {
  return String(s || "").trim().toLowerCase();
}

function containsText(arr, text) {
  const t = normalizeText(text);
  return (arr || []).some((x) => normalizeText(x) === t);
}

function toStateFromTemplate(templateObj) {
  const out = {};
  for (const listId of CATEGORY_IDS) {
    const items = templateObj[listId] || [];
    out[listId] = items.map((t) => ({ text: t, crossed: false }));
  }
  return out;
}

function loadTemplate() {
  const raw = localStorage.getItem(TEMPLATE_KEY);
  if (!raw) {
    template = JSON.parse(JSON.stringify(factoryDefaultTemplate));
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
    return;
  }

  try {
    template = JSON.parse(raw);
  } catch (e) {
    template = JSON.parse(JSON.stringify(factoryDefaultTemplate));
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
  }

  // Ensure all categories exist
  for (const listId of CATEGORY_IDS) {
    if (!Array.isArray(template[listId])) template[listId] = [];
  }
}

function loadState() {
  // One-time migration: if someone had the older single-key storage, attempt to reuse it
  // Old key used previously: "shoppingList.v1"
  const oldRaw = localStorage.getItem("shoppingList.v1");

  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) {
    if (oldRaw) {
      try {
        const oldState = JSON.parse(oldRaw);
        if (oldState && typeof oldState === "object") {
          // best-effort: accept it if it looks like our state structure
          state = oldState;
          // ensure categories exist
          for (const listId of CATEGORY_IDS) {
            if (!Array.isArray(state[listId])) state[listId] = [];
          }
          saveState();
          return;
        }
      } catch (e) {
        // ignore migration failure
      }
    }

    // Normal first-run initialization
    state = toStateFromTemplate(template);
    saveState();
    return;
  }

  try {
    state = JSON.parse(raw);
  } catch (e) {
    state = toStateFromTemplate(template);
    saveState();
  }

  // Ensure all categories exist
  for (const listId of CATEGORY_IDS) {
    if (!Array.isArray(state[listId])) state[listId] = [];
  }
}

function saveTemplate() {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  setStatus("Saved");
  setTimeout(() => setStatus(""), 700);
}

function isInTemplate(listId, itemText) {
  return containsText(template[listId] || [], itemText);
}

function removeFromTemplate(listId, itemText) {
  const t = normalizeText(itemText);
  template[listId] = (template[listId] || []).filter((x) => normalizeText(x) !== t);
}

function removeFromState(listId, itemText) {
  const t = normalizeText(itemText);
  state[listId] = (state[listId] || []).filter((it) => normalizeText(it.text) !== t);
}

function renderAll() {
  for (const listId of CATEGORY_IDS) renderList(listId);
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

    // Tap text toggles (mobile friendly)
    span.addEventListener("click", () => {
      state[listId][index].crossed = !state[listId][index].crossed;
      saveState();
      renderList(listId);
    });

    // Cross out button
    const crossBtn = document.createElement("button");
    crossBtn.type = "button";
    crossBtn.textContent = "Cross out";
    crossBtn.classList.add("cross-out-btn");
    crossBtn.addEventListener("click", () => {
      state[listId][index].crossed = !state[listId][index].crossed;
      saveState();
      renderList(listId);
    });

    // Delete button (current only)
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
      state[listId].splice(index, 1);
      saveState();
      renderList(listId);
    });

    // Remove from default button (only meaningful if item exists in template)
    const rmDefaultBtn = document.createElement("button");
    rmDefaultBtn.type = "button";
    rmDefaultBtn.textContent = "Remove default";
    rmDefaultBtn.classList.add("delete-btn");

    const inDefault = isInTemplate(listId, item.text);
    if (!inDefault) {
      rmDefaultBtn.disabled = true;
      rmDefaultBtn.title = "This item is not in your default list";
      rmDefaultBtn.style.opacity = "0.5";
      rmDefaultBtn.style.cursor = "not-allowed";
    } else {
      rmDefaultBtn.addEventListener("click", () => {
        const ok = confirm("Remove this item from your default list? This is permanent on this device.");
        if (!ok) return;

        removeFromTemplate(listId, item.text);
        removeFromState(listId, item.text);

        saveTemplate();
        saveState();
        renderList(listId);
      });
    }

    li.appendChild(span);
    li.appendChild(crossBtn);
    li.appendChild(delBtn);
    li.appendChild(rmDefaultBtn);

    ul.appendChild(li);
  });
}

function addToCurrent(listId, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!state[listId]) state[listId] = [];
  const alreadyThere = (state[listId] || []).some((it) => normalizeText(it.text) === normalizeText(text));
  if (!alreadyThere) state[listId].push({ text, crossed: false });

  input.value = "";
  saveState();
  renderList(listId);
}

function addToDefault(listId, inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // Add to template if missing
  if (!template[listId]) template[listId] = [];
  if (!containsText(template[listId], text)) template[listId].push(text);

  // Add to current state too
  if (!state[listId]) state[listId] = [];
  const alreadyThere = (state[listId] || []).some((it) => normalizeText(it.text) === normalizeText(text));
  if (!alreadyThere) state[listId].push({ text, crossed: false });

  input.value = "";
  saveTemplate();
  saveState();
  renderList(listId);
}

function wireAddButtons() {
  document.querySelectorAll("button[data-list][data-input][data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const listId = btn.dataset.list;
      const inputId = btn.dataset.input;
      const action = btn.dataset.action;

      if (action === "add-default") addToDefault(listId, inputId);
      else addToCurrent(listId, inputId);
    });
  });
}

function wireEnterToAdd() {
  // Enter will do the normal "Add" (current only)
  document.querySelectorAll(".add-row input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;

      event.preventDefault();
      const row = input.closest(".add-row");
      if (!row) return;

      // Prefer add-current button in the same row
      const btn = row.querySelector('button[data-action="add-current"][data-list][data-input]');
      if (!btn) return;

      addToCurrent(btn.dataset.list, btn.dataset.input);
    });
  });
}

function wireReset() {
  const resetBtn = document.getElementById("reset-btn");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    const ok = confirm("Reset the whole list to your default list? This will remove added items and uncross everything.");
    if (!ok) return;

    state = toStateFromTemplate(template);
    saveState();
    renderAll();
  });
}

function wireUncrossAll() {
  const btn = document.getElementById("uncross-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    for (const listId of CATEGORY_IDS) {
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
    } catch (e) {
      // ignore
    }
  });
}

// Init
loadTemplate();
loadState();
wireAddButtons();
wireEnterToAdd();
wireReset();
wireUncrossAll();
renderAll();
registerServiceWorker();
