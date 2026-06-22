import { setupFormToggle } from "./form-toggle.js";
let items = [];

setupFormToggle({
  buttonSelector: "#show-item-form-button",
  panelSelector: "#item-form-panel",
  openText: "+ New SKU",
  closeText: "Close Form",
});

const itemList = document.querySelector("#item-list");
const itemSearchInput = document.querySelector("#item-search");
const itemForm = document.querySelector("#item-form");
const itemFormPanel = document.querySelector("#item-form-panel");
const itemFormHeading = document.querySelector("#item-form-heading");
const showItemFormButton = document.querySelector("#show-item-form-button");
const itemSubmitButton = itemForm.querySelector('button[type="submit"]');

let editingItemId = null;
async function fetchItems() {
  try {
    const response = await fetch("/api/items");

    if (!response.ok) {
      throw new Error("Unable to load items.");
    }

    items = await response.json();
    renderItems(items);
  } catch (error) {
    console.error(error);

    itemList.innerHTML = `
      <p class="empty-message">
        Unable to load item data.
      </p>
    `;
  }
}

function createVendorList(associatedVendors) {
  if (associatedVendors.length === 0) {
    return "<li>No associated vendors</li>";
  }

  return associatedVendors
    .map(
      (vendorName) => `
        <li>${vendorName}</li>
      `,
    )
    .join("");
}

function createItemCard(item) {
  const vendorCount = item.associatedVendors.length;

  return `
    <article class="item-card" data-item-id="${item.id}">
      <div class="item-card-header">
        <div>
          <p class="sku-number">${item.sku}</p>
          <h3>${item.itemName}</h3>
        </div>

        <p class="vendor-count">
          ${vendorCount} ${vendorCount === 1 ? "Vendor" : "Vendors"}
        </p>
      </div>

      <dl class="item-details">
        <div>
          <dt>Category</dt>
          <dd>${item.category}</dd>
        </div>

        <div>
          <dt>Unit</dt>
          <dd>${item.unit}</dd>
        </div>

        <div>
          <dt>Description</dt>
          <dd>${item.description}</dd>
        </div>

        <div>
          <dt>Notes</dt>
          <dd>${item.notes}</dd>
        </div>
      </dl>

      <div class="associated-vendors">
        <h4>Available Vendors</h4>

        <ul>
          ${createVendorList(item.associatedVendors)}
        </ul>
      </div>

      <div class="card-actions">

        <button
          class="edit-item-button"
          type="button"
          data-item-id="${item.id}"
        >
          Edit
        </button>

        <button
          class="delete-item-button"
          type="button"
          data-item-id="${item.id}"
        >
          Delete
        </button>
      </div>
    </article>
  `;
}

function renderItems(itemData) {
  if (itemData.length === 0) {
    itemList.innerHTML = `
      <p class="empty-message">
        No SKUs match your search.
      </p>
    `;

    return;
  }

  itemList.innerHTML = itemData.map(createItemCard).join("");
}

function searchItems(event) {
  const searchTerm = event.target.value.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const sku = item.sku.toLowerCase();
    const itemName = item.itemName.toLowerCase();
    const category = item.category.toLowerCase();

    return (
      sku.includes(searchTerm) ||
      itemName.includes(searchTerm) ||
      category.includes(searchTerm)
    );
  });

  renderItems(filteredItems);
}

function resetItemForm() {
  editingItemId = null;

  itemForm.reset();
  itemFormHeading.textContent = "Add a New SKU";
  itemSubmitButton.textContent = "Save SKU";

  itemFormPanel.classList.add("hidden");
  showItemFormButton.textContent = "+ New SKU";
}

async function saveItem(event) {
  event.preventDefault();

  const formData = new FormData(itemForm);

  const associatedVendorsText = formData.get("associatedVendors").trim();

  const associatedVendors = associatedVendorsText
    ? associatedVendorsText
        .split(",")
        .map((vendorName) => vendorName.trim())
        .filter((vendorName) => vendorName !== "")
    : [];

  const itemData = {
    sku: formData.get("sku").trim(),
    itemName: formData.get("itemName").trim(),
    category: formData.get("category").trim(),
    unit: formData.get("unit").trim(),
    description: formData.get("description").trim(),
    notes: formData.get("notes").trim(),
    associatedVendors,
  };

  try {
    let response;

    if (editingItemId) {
      response = await fetch(`/api/items/${editingItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });
    } else {
      response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });
    }

    if (!response.ok) {
      throw new Error("Unable to save item.");
    }

    await fetchItems();
    resetItemForm();
  } catch (error) {
    console.error(error);
    window.alert("Unable to save the SKU.");
  }
}

function editItem(itemId) {
  const itemToEdit = items.find((item) => item.id === itemId);

  if (!itemToEdit) {
    return;
  }

  editingItemId = itemId;

  itemForm.elements.sku.value = itemToEdit.sku;
  itemForm.elements.itemName.value = itemToEdit.itemName;
  itemForm.elements.category.value = itemToEdit.category;
  itemForm.elements.unit.value = itemToEdit.unit;
  itemForm.elements.description.value = itemToEdit.description;
  itemForm.elements.notes.value = itemToEdit.notes;
  itemForm.elements.associatedVendors.value =
    itemToEdit.associatedVendors.join(", ");

  itemFormHeading.textContent = "Edit SKU";
  itemSubmitButton.textContent = "Update SKU";

  itemFormPanel.classList.remove("hidden");
  showItemFormButton.textContent = "Close Form";

  itemFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

async function deleteItem(itemId) {
  const itemToDelete = items.find((item) => item.id === itemId);

  if (!itemToDelete) {
    return;
  }

  const userConfirmed = window.confirm(
    `Are you sure you want to delete ${itemToDelete.sku} - ${itemToDelete.itemName}?`,
  );

  if (!userConfirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Unable to delete item.");
    }

    await fetchItems();
  } catch (error) {
    console.error(error);
    window.alert("Unable to delete the SKU.");
  }
}

function handleItemListClick(event) {
  const editButton = event.target.closest(".edit-item-button");
  const deleteButton = event.target.closest(".delete-item-button");

  if (editButton) {
    const itemId = editButton.dataset.itemId;
    editItem(itemId);
    return;
  }

  if (deleteButton) {
    const itemId = deleteButton.dataset.itemId;
    deleteItem(itemId);
  }
}

itemSearchInput.addEventListener("input", searchItems);
itemForm.addEventListener("submit", saveItem);
itemList.addEventListener("click", handleItemListClick);

fetchItems();
