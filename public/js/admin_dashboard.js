document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("companies-container");
    const loadingIndicator = document.getElementById("loading");
    const errorMessage = document.getElementById("error-message");

    const modal = document.getElementById("company-modal");
    const modalTitle = document.getElementById("modal-title");
    const closeModal = document.getElementById("close-modal");
    const companyForm = document.getElementById("company-form");
    const companyIdField = document.getElementById("company-id");
    const companyNameField = document.getElementById("company-name");
    const companyDescriptionField = document.getElementById("company-description");

    const addCompanyBtn = document.getElementById("add-company-btn");

    const confirmationModal = document.getElementById("confirmation-modal");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    let companyToDelete = null;

    // Open the modal
    function openModal(title, company = null) {
        modalTitle.textContent = title;
        if (company) {
            companyIdField.value = company._id;
            companyNameField.value = company.name;
            companyDescriptionField.value = company.description;
        } else {
            companyIdField.value = '';
            companyNameField.value = '';
            companyDescriptionField.value = '';
        }
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    }

    // Close the modal
    closeModal.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.style.display = "none";
    });

    // Open confirmation modal
    function openConfirmationModal(companyId) {
        companyToDelete = companyId;
        confirmationModal.style.display = "flex";
    }

    // Close confirmation modal
    function closeConfirmationModal() {
        confirmationModal.style.display = "none";
        companyToDelete = null;
    }

    // Fetch companies from the API
    function fetchCompanies() {
        loadingIndicator.style.display = "block";
        fetch("/api/admin/companies")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch companies.");
                }
                return response.json();
            })
            .then(data => {
                loadingIndicator.style.display = "none";
                container.innerHTML = '';
                if (data.companies.length === 0) {
                    errorMessage.textContent = "No companies found.";
                    errorMessage.hidden = false;
                    return;
                }

                data.companies.forEach(company => {
                    const block = document.createElement("div");
                    block.classList.add("company-block");
                    block.innerHTML = `
                        <a href="/admin/${company.name}" class="company-link">
                            <span>${company.name}</span>
                        </a>
                        <button class="edit-btn" data-id="${company._id}">Edit</button>
                        <button class="delete-btn" data-id="${company._id}">Delete</button>
                    `;
                    container.appendChild(block);
                });

                // Add event listeners to edit and delete buttons
                document.querySelectorAll(".edit-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const id = e.target.dataset.id;
                        const company = data.companies.find(c => c._id === id);
                        openModal("Edit Company", company);
                    });
                });

                document.querySelectorAll(".delete-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        const id = e.target.dataset.id;
                        openConfirmationModal(id);
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching companies:", error);
                loadingIndicator.style.display = "none";
                errorMessage.textContent = "An error occurred while fetching companies.";
                errorMessage.hidden = false;
            });
    }

    // Add or update a company
    companyForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = companyIdField.value;
        const name = companyNameField.value.trim();
        const description = companyDescriptionField.value.trim();

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/companies/${id}` : `/api/admin/companies`;

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to save company.");
                }
                return response.json();
            })
            .then(() => {
                modal.classList.add("hidden");
                modal.style.display = "none";
                fetchCompanies();
            })
            .catch(error => {
                console.error("Error saving company:", error);
            });
    });

    // Confirm deletion
    confirmDeleteBtn.addEventListener("click", () => {
        if (companyToDelete) {
            fetch(`/api/admin/companies/${companyToDelete}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete company.");
                    }
                    return response.json();
                })
                .then(() => {
                    closeConfirmationModal();
                    fetchCompanies();
                })
                .catch(error => {
                    console.error("Error deleting company:", error);
                });
        }
    });

    // Cancel deletion
    cancelDeleteBtn.addEventListener("click", closeConfirmationModal);

    // Add company button event listener
    addCompanyBtn.addEventListener("click", () => openModal("Add Company"));

    // Initial fetch of companies
    fetchCompanies();
});
