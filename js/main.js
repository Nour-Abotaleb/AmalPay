let transactions = [];
let users = [];

// Initialize cards to empty
document.getElementById("recipientName").innerHTML = '';
document.getElementById("totalAmount").innerHTML = '';
document.getElementById("rejectedCount").innerHTML = '';

// Fetch transactions and users data from JSON file
document.addEventListener("DOMContentLoaded", function () {
    fetch('transactions.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load data');
            return response.json();
        })
        .then(data => {
            transactions = data.transactions;
            users = data.users;
            console.log('Transactions:', transactions);
            console.log('Users:', users); // Check if data is properly loaded

            // Initially display all transactions
            displayTransactions(transactions);
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

// Function to get user by user code
function getUserByCode(code) {
    return users.find(user => user.code === code) || null;
}

// Display transactions in the table

function displayTransactions(filteredTransactions) {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = ''; // Clear previous table content

    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach(transaction => {
            const user = getUserByCode(transaction.userCode);

            // Skip this transaction if there is no matching user
            if (!user) {
                return; // Skip to the next transaction
            }

            const row = document.createElement("tr");
            row.classList.add(transaction.status === "مكتملة" ? "completed" : "rejected");

            row.innerHTML = `
                <td>${transaction.userCode}</td>
                <td>${user.name}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.time}</td>
                <td>${transaction.date}</td>
                <td>${transaction.status}</td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById("transactionTable").style.display = "table"; // Show table
        updateCards(filteredTransactions); // Update card details
    } else {
        hideCards(); // Hide cards and table if no transactions are found
    }
}

// Event listener for search button
document.querySelector("#searchButton").addEventListener("click", searchTransactions);

// Search and filter transactions based on criteria

function searchTransactions() {
    const searchTerm = document.querySelector("#searchBar").value.toLowerCase();
    const startDateFilter = document.querySelector("#startDateFilter").value;
    const endDateFilter = document.querySelector("#endDateFilter").value;
    const statusFilter = document.querySelector("#statusFilter").value;

    const filteredTransactions = transactions.filter(transaction => {
        const user = getUserByCode(transaction.userCode);
        const matchesCodeOrName = transaction.userCode.toLowerCase().includes(searchTerm) ||
            (user && user.name.toLowerCase().startsWith(searchTerm));

        const matchesDate = (!startDateFilter || new Date(transaction.date) >= new Date(startDateFilter)) &&
                            (!endDateFilter || new Date(transaction.date) <= new Date(endDateFilter));

        const matchesStatus = !statusFilter || transaction.status === statusFilter;

        return matchesCodeOrName && matchesDate && matchesStatus;
    });

    displayTransactions(filteredTransactions);

    // Show the cards only if there are filtered transactions
    if (filteredTransactions.length > 0) {
        updateCards(filteredTransactions);
        document.getElementById("cardsContainer").style.display = "flex"; // Show cards
    } else {
        hideCards(); // Hide cards if no transactions are found
    }
}

// Hide cards and table when no transactions are found
function hideCards() {
    document.getElementById("cardsContainer").style.display = "none"; // Hide cards
    document.getElementById("transactionTable").style.display = "none"; // Hide table
}

// Function to create the chart

let transfersChart;

function createChart(completedCount, rejectedCount) {
    const ctx = document.getElementById('transfersChart').getContext('2d');
    if (transfersChart) {
        transfersChart.data.datasets[0].data = [completedCount, rejectedCount]; // Update existing chart
        transfersChart.update(); // Refresh the chart
    } else {
        transfersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['مكتملة', 'مرفوضة'],
                datasets: [{
                    label: 'عدد التحويلات',
                    data: [completedCount, rejectedCount],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)', // Completed color
                        'rgba(255, 99, 132, 0.2)'   // Rejected color
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد التحويلات'
                        }
                    }
                }
            }
        });
    }
}
  
// Update cards and chart details based on filtered transactions
  
function updateCards(filteredTransactions) {
    if (filteredTransactions.length === 0) {
        hideCards(); // Hide cards if no transactions are found
        return;
    }

    const totalAmount = filteredTransactions
        .filter(t => t.status === "مكتملة")
        .reduce((sum, t) => sum + t.amount, 0);

    const rejectedCount = filteredTransactions
        .filter(t => t.status === "مرفوضة")
        .length;

    const completedCount = filteredTransactions.length - rejectedCount;

    // Assuming the first transaction corresponds to the specific inmate
    const userCode = filteredTransactions[0].userCode;
    const user = getUserByCode(userCode);

    // Update card details
    document.getElementById("recipientName").innerHTML = `<h5>${user ? user.name : 'Unknown'}</h5>`;
    document.getElementById("totalAmount").innerHTML = `<h5>${totalAmount}</h5>`;
    document.getElementById("rejectedCount").innerHTML = `<h5>${rejectedCount}</h5>`;

    // Create or update the chart
    createChart(completedCount, rejectedCount); // Ensure this is called to update the chart

    document.getElementById("cardsContainer").style.display = "flex"; // Show cards
}
