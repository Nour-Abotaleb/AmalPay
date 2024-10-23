
let transactions = [];
let users = [];

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
            console.log('Users:', users); 

            displayTransactions(transactions);
            updateCards(transactions); 
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

// get user by user code
function getUserByCode(code) {
    return users.find(user => user.code === code) || null;
}

// display transactions in the table
function displayTransactions(filteredTransactions) {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = ''; 

    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach(transaction => {
            const user = getUserByCode(transaction.userCode);
            if (!user) return; 

            const row = document.createElement("tr");
            row.classList.add(transaction.status === "مكتملة" ? "completed" : "rejected");

            row.innerHTML = `
                <td>${transaction.userCode}</td>
                <td>${user.name}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.time}</td>
                <td>${transaction.date}</td>
                <td>${transaction.status}</td>
                <td>${user.governorate || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById("transactionTable").style.display = "table";
        updateCards(filteredTransactions); 
    } else {
        hideCards(); 
    }
}

document.querySelector("#searchButton").addEventListener("click", searchTransactions);

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

   
        const matchesStatus = statusFilter === "الكل" || transaction.status === statusFilter;

        return matchesCodeOrName && matchesDate && matchesStatus;
    });

    displayTransactions(filteredTransactions);

    if (filteredTransactions.length > 0) {
        updateCards(filteredTransactions);
        document.getElementById("cardsContainer").style.display = "flex"; // Show cards
    } else {
        hideCards(); // Hide cards if no transactions are found
    }
}

function hideCards() {
    document.getElementById("cardsContainer").style.display = "none"; 
    document.getElementById("transactionTable").style.display = "none"; 
}

let transfersChart, barChart;

function createChart(completedCount, rejectedCount) {
    const ctx = document.getElementById('transfersChart').getContext('2d');
    if (transfersChart) {
        transfersChart.data.datasets[0].data = [completedCount, rejectedCount];
        transfersChart.update();
    } else {
        transfersChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['مكتملة', 'مرفوضة'],
                datasets: [{
                    data: [completedCount, rejectedCount],
                    backgroundColor: [
                        'rgba(3, 110, 49, 0.5)',
                        'rgba(250, 2, 52, 0.5)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw;
                            }
                        }
                    }
                }
            }
        });
    }
}

function createBarChart(completedCount, rejectedCount) {
    const ctx = document.getElementById('barChart').getContext('2d');
    if (barChart) {
        barChart.data.datasets[0].data = [completedCount, rejectedCount];
        barChart.update();
    } else {
        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['مكتملة', 'مرفوضة'],
                datasets: [{
                    label: 'عدد التحويلات',
                    data: [completedCount, rejectedCount],
                    backgroundColor: [
                         'rgba(3, 110, 49, 0.5)',
                        'rgba(250, 2, 52, 0.5)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateCards(filteredTransactions) {
    if (filteredTransactions.length === 0) {
        hideCards(); 
        return;
    }

    const totalAmount = filteredTransactions
        .filter(t => t.status === "مكتملة")
        .reduce((sum, t) => sum + t.amount, 0);

    const rejectedCount = filteredTransactions
        .filter(t => t.status === "مرفوضة")
        .length;

    const completedCount = filteredTransactions.length - rejectedCount;

    document.getElementById("recipientName").innerHTML = `<h5>${filteredTransactions[0].userCode}</h5>`;
    document.getElementById("totalAmount").innerHTML = `<h5>${totalAmount}</h5>`;
    document.getElementById("rejectedCount").innerHTML = `<h5>${rejectedCount}</h5>`;

    createChart(completedCount, rejectedCount);
    createBarChart(completedCount, rejectedCount); 

    document.getElementById("cardsContainer").style.display = "flex";
}
document.addEventListener("DOMContentLoaded", function () {
    const completedCount = transactions.filter(t => t.status === "مكتملة").length;
    const rejectedCount = transactions.filter(t => t.status === "مرفوضة").length;

    createChart(completedCount, rejectedCount);
    createBarChart(completedCount, rejectedCount);
});

document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.querySelector('.navbar .icons i');
    const sidebar = document.querySelector('.sidebar');
  
    menuIcon.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });
});
