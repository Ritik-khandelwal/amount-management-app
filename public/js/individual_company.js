document.addEventListener('DOMContentLoaded', () => {
    const companyName = decodeURIComponent(window.location.pathname.split('/')[2]);
    document.getElementById("company-name").textContent = companyName;

    // Show Notification
    function showNotification(message, isError = false) {
        const notification = document.getElementById("notification");
        const messageElement = document.getElementById("notification-message");

        messageElement.textContent = message;
        notification.classList.toggle('error', isError);
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000); // Hide notification after 3 seconds
    }

    // Fetch receivables and payables
    async function fetchAmounts() {
        try {
            const receivablesResponse = await fetch(`/api/companies/${companyName}/receivables`);
            const payablesResponse = await fetch(`/api/companies/${companyName}/payables`);
            
            const receivables = await receivablesResponse.json();
            const payables = await payablesResponse.json();
    
            // Populate receivables and payables tables
            populateTable("#receivables-table", receivables, "#total-receivable");
            populateTable("#payables-table", payables, "#total-payable");
    
        } catch (error) {
            console.error("Error fetching amounts:", error);
            showNotification("Failed to fetch data. Please try again.", true);
        }
    }

    // Populate the table with data
    function populateTable(selector, data, totalSelector) {
        const tableBody = document.querySelector(`${selector} tbody`);
        tableBody.innerHTML = ''; // Clear table body
    
        let totalAmount = 0; // Initialize total amount
    
        // Formatter for thousand separators
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    
        data.forEach((item, index) => {
            totalAmount += item.amount; // Add to total
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td contenteditable="true" data-field="name">${item.name}</td>
                <td contenteditable="true" data-field="amount">${formatter.format(item.amount)}</td>
                <td contenteditable="true" data-field="asOfDate">${new Date(item.asOfDate).toISOString().split('T')[0]}</td>
                <td><input type="checkbox" disabled ${item.markChecked ? "checked" : ""}></td>
                <td>
                    <button class="save-btn" data-id="${item._id}">Save</button>
                    <button class="delete-btn" data-id="${item._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    
        // Update the total amount
        const totalElement = document.querySelector(totalSelector);
        totalElement.textContent = formatter.format(totalAmount);
    }

    // Save updated data
    async function saveEntry(entryId, updatedData) {
        try {
            const response = await fetch(`/api/companies/${companyName}/entries/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error('Failed to update entry.');
            showNotification("Entry updated successfully.");
            fetchAmounts(); // Refresh the table
        } catch (error) {
            console.error("Error saving entry:", error);
            showNotification("Failed to save entry. Please try again.", true);
        }
    }

    // Delete an entry
    async function deleteEntry(entryId) {
        try {
            const response = await fetch(`/api/companies/${companyName}/entries/${entryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete entry.');
            showNotification("Entry deleted successfully.");
            fetchAmounts(); // Refresh the table
        } catch (error) {
            console.error("Error deleting entry:", error);
            showNotification("Failed to delete entry. Please try again.", true);
        }
    }

    // Open the modal for adding a new entry
    document.querySelector('#add-entry-btn').addEventListener('click', () => {
        const modal = document.getElementById('add-entry-modal');
        modal.style.display = 'flex'; // Show the modal
    });

    // Cancel button inside the modal
    document.querySelector('#cancel-entry-btn').addEventListener('click', () => {
        const modal = document.getElementById('add-entry-modal');
        modal.style.display = 'none'; // Close the modal
    });

    // Handle the form submission for adding a new entry
    document.querySelector('#add-entry-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const newEntry = {
            name: document.getElementById('entry-name').value,
            amount: parseFloat(document.getElementById('entry-amount').value),
            asOfDate: document.getElementById('entry-date').value,
            type: document.getElementById('entry-type').value,
        };

        try {
            const response = await fetch(`/api/companies/${companyName}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry),
            });

            if (!response.ok) throw new Error('Failed to add new entry.');
            showNotification("Entry added successfully.");
            fetchAmounts(); // Refresh the table
            document.getElementById('add-entry-modal').style.display = 'none'; // Close modal
        } catch (error) {
            console.error("Error adding entry:", error);
            showNotification("Failed to add new entry. Please try again.", true);
        }
    });

    // Delegate event listeners for Save and Delete buttons (both receivables and payables)
    document.querySelector('body').addEventListener('click', (event) => {
        // Check if the clicked target is the Save button
        if (event.target.classList.contains('save-btn')) {
            const row = event.target.closest('tr');
            const entryId = event.target.dataset.id;
    
            // Extract values from the editable fields
            const updatedData = {
                name: row.querySelector('[data-field="name"]').textContent.trim(),
                amount: parseInt(row.querySelector('[data-field="amount"]').textContent.replace(/,/g, ''), 10), // Parse as an integer
                asOfDate: row.querySelector('[data-field="asOfDate"]').textContent.trim(),
            };
    
            // Validate amount to ensure it's a valid number
            if (isNaN(updatedData.amount)) {
                showNotification("Invalid amount entered. Please enter a valid number.", true);
                return;
            }
    
            saveEntry(entryId, updatedData);
        }

        // Check if the clicked target is the Delete button
        if (event.target.classList.contains('delete-btn')) {
            const entryId = event.target.dataset.id;
            deleteEntry(entryId);
        }
    });

    fetchAmounts(); // Initial load
});
