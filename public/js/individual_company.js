document.addEventListener('DOMContentLoaded', () => {
    const companyName = decodeURIComponent(window.location.pathname.split('/')[2]);
    document.getElementById("company-name").textContent = companyName;

    // Fetch receivables and payables
    async function fetchAmounts() {
        try {
            const receivablesResponse = await fetch(`/api/companies/${companyName}/receivables`);
            const payablesResponse = await fetch(`/api/companies/${companyName}/payables`);
            
            const receivables = await receivablesResponse.json();
            const payables = await payablesResponse.json();

            populateTable("#receivables-table", receivables);
            populateTable("#payables-table", payables);

        } catch (error) {
            console.error("Error fetching amounts:", error);
        }
    }

    // Populate the table with data
    function populateTable(selector, data) {
        const tableBody = document.querySelector(`${selector} tbody`);
        tableBody.innerHTML = ''; // Clear table body

        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td contenteditable="true" data-field="name">${item.name}</td>
                <td contenteditable="true" data-field="amount">${item.amount}</td>
                <td contenteditable="true" data-field="asOfDate">${new Date(item.asOfDate).toISOString().split('T')[0]}</td>
                <td><input type="checkbox" disabled ${item.markChecked ? "checked" : ""}></td>
                <td>
                    <button class="save-btn" data-id="${item._id}">Save</button>
                    <button class="delete-btn" data-id="${item._id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
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
            alert("Entry updated successfully.");
        } catch (error) {
            console.error("Error saving entry:", error);
        }
    }

    // Delete an entry
    async function deleteEntry(entryId) {
        try {
            const response = await fetch(`/api/companies/${companyName}/entries/${entryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete entry.');
            alert("Entry deleted successfully.");
            fetchAmounts(); // Refresh the table
        } catch (error) {
            console.error("Error deleting entry:", error);
        }
    }

    // Event listener for Save and Delete buttons
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('save-btn')) {
            const row = event.target.closest('tr');
            const entryId = event.target.dataset.id;

            const updatedData = {
                name: row.querySelector('[data-field="name"]').textContent,
                amount: parseFloat(row.querySelector('[data-field="amount"]').textContent),
                asOfDate: row.querySelector('[data-field="asOfDate"]').textContent,
            };

            saveEntry(entryId, updatedData);
        }

        if (event.target.classList.contains('delete-btn')) {
            const entryId = event.target.dataset.id;
            deleteEntry(entryId);
        }
    });

    // Add a new entry
    document.querySelector('#add-entry-btn').addEventListener('click', async () => {
        const newEntry = {
            name: prompt("Enter name:"),
            amount: parseFloat(prompt("Enter amount:")),
            asOfDate: prompt("Enter date (YYYY-MM-DD):"),
            type: confirm("Is this a receivable? Click OK for yes, Cancel for payable.") ? 'receivable' : 'payable',
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
            alert("Entry added successfully.");
            fetchAmounts(); // Refresh the table
        } catch (error) {
            console.error("Error adding entry:", error);
        }
    });

    fetchAmounts(); // Initial load
});
