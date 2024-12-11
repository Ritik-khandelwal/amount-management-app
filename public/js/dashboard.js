document.addEventListener('DOMContentLoaded', () => {
    const companyName = decodeURIComponent(window.location.pathname.split('/')[2]);
    document.getElementById("company-name").textContent = companyName;

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#28a745';
    notification.style.color = '#fff';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.display = 'none';
    document.body.appendChild(notification);

    // Function to show a notification message
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.backgroundColor = isError ? '#dc3545' : '#28a745'; // Red for errors, green for success
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }

    async function fetchAmounts() {
        try {
            const receivablesResponse = await fetch(`/api/companies/${companyName}/receivables`);
            const payablesResponse = await fetch(`/api/companies/${companyName}/payables`);

            const receivables = await receivablesResponse.json();
            const payables = await payablesResponse.json();

            const receivablesTableBody = document.querySelector("#receivables-table tbody");
            const payablesTableBody = document.querySelector("#payables-table tbody");
            receivablesTableBody.innerHTML = ""; // Clear table
            payablesTableBody.innerHTML = ""; // Clear table

            let totalReceivable = 0;
            let totalPayable = 0;

            receivables.forEach((item, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.amount.toLocaleString()}</td>
                    <td>${new Date(item.asOfDate).toLocaleDateString()}</td>
                    <td>
                        <input type="checkbox" class="mark-check" data-id="${item._id}" ${item.markChecked ? "checked" : ""}>
                    </td>
                `;
                receivablesTableBody.appendChild(row);
                totalReceivable += item.amount;
            });

            document.getElementById("total-receivable").textContent = totalReceivable.toLocaleString();

            payables.forEach((item, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.amount.toLocaleString()}</td>
                    <td>${new Date(item.asOfDate).toLocaleDateString()}</td>
                    <td>
                        <input type="checkbox" class="mark-check" data-id="${item._id}" ${item.markChecked ? "checked" : ""}>
                    </td>
                `;
                payablesTableBody.appendChild(row);
                totalPayable += item.amount;
            });

            document.getElementById("total-payable").textContent = totalPayable.toLocaleString();
        } catch (error) {
            console.error("Error fetching amounts:", error);
        }
    }

    // Handle "Mark as Check" updates
    document.body.addEventListener('change', async (event) => {
        if (event.target.classList.contains('mark-check')) {
            const checkbox = event.target;
            const entryId = checkbox.dataset.id;
            const newState = checkbox.checked;

            try {
                const response = await fetch(`/api/companies/${companyName}/entries/${entryId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ markChecked: newState }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update state');
                }

                showNotification(`Entry marked as ${newState ? 'checked' : 'unchecked'} successfully.`);
            } catch (error) {
                console.error("Error updating state:", error);
                showNotification('Error updating entry. Please try again.', true);
                checkbox.checked = !newState; // Revert checkbox state on error
            }
        }
    });

    fetchAmounts();
});
