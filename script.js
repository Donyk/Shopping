// Example data structure
const data = {
    'dairy-products': ['Butter', 'Milk', 'Cheese', 'Yogurt'],
    'bakery-grains': ['Bread', 'Pasta', 'Rice'],
    'pantry-staples': ['Olive Oil', 'Salt', 'Sugar', 'Flour', 'Baking Powder', 'Vinegar', 'Canned Beans', 'Canned Tomatoes', 'Spices', 'Condiments', 'Baking Ingredients'],
    'breakfast': ['Coffee beans', 'Tea', 'Muesli', 'Jam'],
    'personal-care': ['Toilet Paper', 'Hand Soap', 'Body Soap', 'Shampoo', 'Q-Tips', 'Deodorant', 'Toothpaste', 'Toothbrush'],
    'cleaning-supplies': ['Laundry Detergent', 'Dishwasher Tabs', 'Cleaning Supplies', 'Dish Soap', 'Sponges', 'Toilet flush freshener'],
    'household-items': ['Trash Bags', 'Küchenrolle', 'Aluminum Foil', 'Backpapier'],
    'snacks': ['Almonds, walnuts…', 'Snacks'],
    'fruits-vegetables': ['Almonds, walnuts…', 'Avocadoes'],
    'others': ['Batteries']
};


// Function to add item to a list
function addItem(listId, inputId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    const itemText = input.value;
    if (itemText) {
        const listItem = createListItem(itemText);
        list.appendChild(listItem);
        input.value = '';
    }
}

// Function to create list item with a cross-out button
function createListItem(itemText) {
  const listItem = document.createElement('li');

    const itemSpan = document.createElement('span');
    itemSpan.textContent = itemText;
    listItem.appendChild(itemSpan);

    const crossOutButton = document.createElement('button');
    crossOutButton.textContent = 'Cross Out';
    crossOutButton.classList.add('cross-out-btn');
    crossOutButton.onclick = () => itemSpan.classList.toggle('crossed-out');
    listItem.appendChild(crossOutButton);

    return listItem;
}


// Dairy Products
document.getElementById('new-dairy-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('dairy-products', 'new-dairy-item');
    }
});

// Bakery & Grains
document.getElementById('new-bakery-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('bakery-grains', 'new-bakery-item');
    }
});

// Pantry Staples
document.getElementById('new-pantry-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('pantry-staples', 'new-pantry-item');
    }
});

// Breakfast
document.getElementById('Breakfast').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('breakfast', 'Breakfast');
    }
});

// Personal Care
document.getElementById('new-personal-care-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('personal-care', 'new-personal-care-item');
    }
});

// Cleaning Supplies
document.getElementById('cleaning-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('cleaning-supplies', 'cleaning-item');
    }
});

// Household Items
document.getElementById('household-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('household-items', 'household-item');
    }
});

// Snacks
document.getElementById('Snacks-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('snacks', 'Snacks-item');
    }
});

// Fruits & Vegetables
document.getElementById('Fruits-Vegetables-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('fruits-vegetables', 'Fruits-Vegetables-item');
    }
});

// Others
document.getElementById('Others-item').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        addItem('others', 'Others-item');
    }
});


// Function to load initial items
function loadItems() {
    for (const [listId, items] of Object.entries(data)) {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        items.forEach(item => {
            const listItem = createListItem(item);
            list.appendChild(listItem);
        });
    }
}

// Reset function to revert back to the default list
function resetList() {
    loadItems();
}

// Load items when the page loads
window.onload = loadItems;
