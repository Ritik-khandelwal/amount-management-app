document.addEventListener('DOMContentLoaded', () => {
    // Retrieve companyName from the URL (or dynamically passed in)
    const companyName = decodeURIComponent(window.location.pathname.split('/')[2]); // Extract companyName from the URL
    console.log("Extracted companyName:", companyName);

    // Set company name on the dashboard
    document.getElementById("company-name").textContent = companyName;

    // Fetch and display the receivables and payables
    async function fetchAmounts() {
        try {
            // Fetch data from the API using companyName (updated route)
            const receivablesResponse = await fetch(`/api/companies/${companyName}/receivables`);
            const payablesResponse = await fetch(`/api/companies/${companyName}/payables`);
            
            
            const receivables = await receivablesResponse.json();
            const payables = await payablesResponse.json();
            
            // Insert receivables data into the table
            const receivablesTableBody = document.querySelector("#receivables-table tbody");
            let totalReceivable = 0;
            receivables.forEach((item, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.amount.toLocaleString()}</td> <!-- Format amount with commas -->
                    <td>${new Date(item.asOfDate).toLocaleDateString()}</td>
                    <td><input type="checkbox" ${item.markChecked ? "checked" : ""} data-id="${item._id}"></td>
                `;

                receivablesTableBody.appendChild(row);
                totalReceivable += item.amount;
            });

            document.getElementById("total-receivable").textContent = totalReceivable.toLocaleString(); // Total with commas

            // Insert payables data into the table
            const payablesTableBody = document.querySelector("#payables-table tbody");
            let totalPayable = 0;
            payables.forEach((item, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.amount.toLocaleString()}</td> <!-- Format amount with commas -->
                    <td>${new Date(item.asOfDate).toLocaleDateString()}</td>
                    <td><input type="checkbox" ${item.markChecked ? "checked" : ""} data-id="${item._id}"></td>
                `;

                payablesTableBody.appendChild(row);
                totalPayable += item.amount;
            });

            document.getElementById("total-payable").textContent = totalPayable.toLocaleString(); // Total with commas
        } catch (error) {
            console.error("Error fetching amounts:", error);
        }
    }

    fetchAmounts();
});
