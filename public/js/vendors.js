import { setupFormToggle } from "./form-toggle.js";
import { vendors } from "./mock-data.js";

setupFormToggle({
    buttonSelector: "#show-vendor-form-button",
    panelSelector: "#vendor-form-panel",
    openText: "+ New Vendor",
    closeText: "Close Form",
});

const vendorList = document.querySelector("#vendor-list");
const vendorSearchInput = document.querySelector("#vendor-search");
const vendorForm = document.querySelector("#vendor-form");
const vendorFormPanel = document.querySelector("#vendor-form-panel");
const showVendorFormButton = document.querySelector(
    "#show-vendor-form-button",
);
const vendorFormHeading = document.querySelector(
    "#vendor-form-heading",
);
const vendorSubmitButton = vendorForm.querySelector(
    'button[type="submit"]',
);

let editingVendorId = null;

function createRatingStars(rating) {
    const filledStars = "★".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);

    return filledStars + emptyStars;
}

function createSkuList(associatedSkus) {
    if (associatedSkus.length === 0) {
        return "<li>No associated SKUs</li>";
    }

    return associatedSkus
        .map(
            (sku) => `
        <li>
          <a href="./items.html">${sku}</a>
        </li>
      `,
        )
        .join("");
}

function createVendorCard(vendor) {
    return `
    <article class="vendor-card" data-vendor-id="${vendor.id}">
      <div class="vendor-card-header">
        <div>
          <h3>${vendor.vendorName}</h3>
          <p class="vendor-category">${vendor.productCategories}</p>
        </div>

        <p
          class="vendor-rating"
          aria-label="Rating ${vendor.rating} out of 5"
        >
          ${createRatingStars(vendor.rating)}
        </p>
      </div>

      <dl class="vendor-details">
        <div>
          <dt>Contact</dt>
          <dd>${vendor.contactPerson}</dd>
        </div>

        <div>
          <dt>Email</dt>
          <dd>${vendor.email}</dd>
        </div>

        <div>
          <dt>Phone</dt>
          <dd>${vendor.phone}</dd>
        </div>

        <div>
          <dt>Delivery Performance</dt>
          <dd>${vendor.deliveryPerformance}</dd>
        </div>

        <div>
          <dt>Notes</dt>
          <dd>${vendor.notes}</dd>
        </div>
      </dl>

      <div class="sku-section">
        <h4>Associated SKUs</h4>

        <ul class="sku-list">
          ${createSkuList(vendor.associatedSkus)}
        </ul>
      </div>

      <div class="card-actions">
        <button
          class="edit-vendor-button"
          type="button"
          data-vendor-id="${vendor.id}"
        >
          Edit
        </button>

        <button
          class="delete-vendor-button"
          type="button"
          data-vendor-id="${vendor.id}"
        >
          Delete
        </button>
      </div>
    </article>
  `;
}

function renderVendors(vendorData) {
    if (vendorData.length === 0) {
        vendorList.innerHTML = `
      <p class="empty-message">
        No vendors match your search.
      </p>
    `;

        return;
    }

    vendorList.innerHTML = vendorData.map(createVendorCard).join("");
}

function searchVendors(event) {
    const searchTerm = event.target.value.trim().toLowerCase();

    const filteredVendors = vendors.filter((vendor) => {
        const vendorName = vendor.vendorName.toLowerCase();
        const categories = vendor.productCategories.toLowerCase();
        const contactPerson = vendor.contactPerson.toLowerCase();

        return (
            vendorName.includes(searchTerm) ||
            categories.includes(searchTerm) ||
            contactPerson.includes(searchTerm)
        );
    });

    renderVendors(filteredVendors);
}

function resetVendorForm() {
    editingVendorId = null;

    vendorForm.reset();
    vendorFormHeading.textContent = "Add a New Vendor";
    vendorSubmitButton.textContent = "Save Vendor";

    vendorFormPanel.classList.add("hidden");
    showVendorFormButton.textContent = "+ New Vendor";
}

function saveVendor(event) {
    event.preventDefault();

    const formData = new FormData(vendorForm);

    const associatedSkusText = formData
        .get("associatedSkus")
        .trim();

    const associatedSkus = associatedSkusText
        ? associatedSkusText
            .split(",")
            .map((sku) => sku.trim())
            .filter((sku) => sku !== "")
        : [];

    const vendorData = {
        vendorName: formData.get("vendorName").trim(),
        contactPerson: formData.get("contactPerson").trim(),
        email: formData.get("email").trim(),
        phone: formData.get("phone").trim(),
        website: formData.get("website").trim(),
        productCategories: formData
            .get("productCategories")
            .trim(),
        rating: Number(formData.get("rating")) || 0,
        deliveryPerformance: formData
            .get("deliveryPerformance")
            .trim(),
        notes: formData.get("notes").trim(),
        associatedSkus,
    };

    if (editingVendorId) {
        const vendorIndex = vendors.findIndex(
            (vendor) => vendor.id === editingVendorId,
        );

        if (vendorIndex !== -1) {
            vendors[vendorIndex] = {
                ...vendors[vendorIndex],
                ...vendorData,
            };
        }
    } else {
        const newVendor = {
            id: `vendor-${Date.now()}`,
            ...vendorData,
        };

        vendors.push(newVendor);
    }

    renderVendors(vendors);
    resetVendorForm();
}

function editVendor(vendorId) {
    const vendorToEdit = vendors.find(
        (vendor) => vendor.id === vendorId,
    );

    if (!vendorToEdit) {
        return;
    }

    editingVendorId = vendorId;

    vendorForm.elements.vendorName.value =
        vendorToEdit.vendorName;
    vendorForm.elements.contactPerson.value =
        vendorToEdit.contactPerson;
    vendorForm.elements.email.value = vendorToEdit.email;
    vendorForm.elements.phone.value = vendorToEdit.phone;
    vendorForm.elements.website.value = vendorToEdit.website;
    vendorForm.elements.productCategories.value =
        vendorToEdit.productCategories;
    vendorForm.elements.rating.value = vendorToEdit.rating;
    vendorForm.elements.deliveryPerformance.value =
        vendorToEdit.deliveryPerformance;
    vendorForm.elements.notes.value = vendorToEdit.notes;
    vendorForm.elements.associatedSkus.value =
        vendorToEdit.associatedSkus.join(", ");

    vendorFormHeading.textContent = "Edit Vendor";
    vendorSubmitButton.textContent = "Update Vendor";

    vendorFormPanel.classList.remove("hidden");
    showVendorFormButton.textContent = "Close Form";

    vendorFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}

function deleteVendor(vendorId) {
    const vendorIndex = vendors.findIndex(
        (vendor) => vendor.id === vendorId,
    );

    if (vendorIndex === -1) {
        return;
    }

    const vendorToDelete = vendors[vendorIndex];

    const userConfirmed = window.confirm(
        `Are you sure you want to delete ${vendorToDelete.vendorName}?`,
    );

    if (!userConfirmed) {
        return;
    }

    vendors.splice(vendorIndex, 1);
    renderVendors(vendors);
}

function handleVendorListClick(event) {
    const editButton = event.target.closest(
        ".edit-vendor-button",
    );
    const deleteButton = event.target.closest(
        ".delete-vendor-button",
    );

    if (editButton) {
        const vendorId = editButton.dataset.vendorId;
        editVendor(vendorId);
        return;
    }

    if (deleteButton) {
        const vendorId = deleteButton.dataset.vendorId;
        deleteVendor(vendorId);
    }
}

vendorSearchInput.addEventListener("input", searchVendors);
vendorForm.addEventListener("submit", saveVendor);
vendorList.addEventListener("click", handleVendorListClick);

renderVendors(vendors);