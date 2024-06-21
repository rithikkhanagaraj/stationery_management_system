// File: script.js

// Function to handle DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Login Form logic
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'password') {
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'setup.html';
            } else {
                loginError.style.display = 'block';
            }
        });
    }

    // Main menu page logic
    const addRequestBtn = document.getElementById('addRequestBtn');
    const viewRequestsBtn = document.getElementById('viewRequestsBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (addRequestBtn) {
        addRequestBtn.addEventListener('click', function() {
            window.location.href = 'budget.html';
        });

        viewRequestsBtn.addEventListener('click', function() {
            window.location.href = 'view-requests.html';
        });

        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('loggedIn');
            window.location.href = 'index.html';
        });
    }

    // Add Request Form logic
    const addRequestForm = document.getElementById('addRequestForm');
    if (addRequestForm) {
        addRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const requestTitle = document.getElementById('requestTitle').value;
            const requestDescription = document.getElementById('requestDescription').value;
            const requestAmount = document.getElementById('requestAmount').value;

            if (isNaN(requestAmount) || requestAmount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: requestTitle,
                        description: requestDescription,
                        amount: parseFloat(requestAmount).toFixed(2),
                        status: 'pending'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to add request');
                }

                alert('Request added successfully!');
                addRequestForm.reset();
            } catch (error) {
                console.error('Error adding request:', error.message);
            }
        });

        const backBtn = document.getElementById('backBtn');
        backBtn.addEventListener('click', function() {
            window.history.back();
        });
    }

    // View Requests logic
    const pendingList = document.getElementById('pendingList');
    const proceededList = document.getElementById('proceededList');

    if (pendingList && proceededList) {
        fetchRequests();
    }

    async function fetchRequests() {
        try {
            const response = await fetch('http://localhost:3000/api/requests');
            if (!response.ok) {
                throw new Error('Failed to fetch requests');
            }
            const requests = await response.json();
            displayRequests(requests);
        } catch (error) {
            console.error('Error fetching requests:', error.message);
        }
    }

    function displayRequests(requests) {
        pendingList.innerHTML = '';
        proceededList.innerHTML = '';

        requests.forEach(function(request, index) {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = `${index + 1}. ${request.title} - Amount: $${request.amount}`;

            if (request.status === 'pending') {
                const proceedBtn = document.createElement('button');
                proceedBtn.classList.add('btn', 'btn-success', 'ml-2');
                proceedBtn.textContent = 'Proceed';
                proceedBtn.addEventListener('click', async function() {
                    if (confirmPassword()) {
                        try {
                            const updatedRequest = { ...request, status: 'proceeded' };
                            await updateRequest(request._id, updatedRequest);
                            fetchRequests();
                        } catch (error) {
                            console.error('Error updating request:', error.message);
                        }
                    }
                });
                li.appendChild(proceedBtn);
                pendingList.appendChild(li);
            } else if (request.status === 'proceeded') {
                const updateBtn = document.createElement('button');
                updateBtn.classList.add('btn', 'btn-primary', 'ml-2');
                updateBtn.textContent = 'Update';
                updateBtn.addEventListener('click', async function() {
                    const newTitle = prompt('Enter updated title:', request.title);
                    const newDescription = prompt('Enter updated description:', request.description);
                    let newAmount = prompt('Enter updated amount:', request.amount);
                    
                    newAmount = parseFloat(newAmount);
                    if (isNaN(newAmount) || newAmount <= 0) {
                        alert('Please enter a valid amount.');
                        return;
                    }
                    
                    try {
                        const updatedRequest = { ...request, title: newTitle, description: newDescription, amount: newAmount };
                        await updateRequest(request._id, updatedRequest);
                        fetchRequests();
                    } catch (error) {
                        console.error('Error updating request:', error.message);
                    }
                });
                li.appendChild(updateBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn', 'btn-danger', 'ml-2');
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', async function() {
                    if (confirm('Are you sure you want to delete this request?')) {
                        try {
                            await deleteRequest(request._id);
                            fetchRequests();
                        } catch (error) {
                            console.error('Error deleting request:', error.message);
                        }
                    }
                });
                li.appendChild(deleteBtn);

                proceededList.appendChild(li);
            }
        });
    }

    async function updateRequest(id, updatedRequest) {
        try {
            const response = await fetch(`http://localhost:3000/api/requests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedRequest)
            });
            if (!response.ok) {
                throw new Error('Failed to update request');
            }
            const updatedData = await response.json();
            return updatedData;
        } catch (error) {
            console.error('Error updating request:', error.message);
            throw error;
        }
    }

    async function deleteRequest(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/requests/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete request');
            }
        } catch (error) {
            console.error('Error deleting request:', error.message);
            throw error;
        }
    }

    function confirmPassword() {
        const password = prompt('Please enter your password to continue:');
        return password === 'password';
    }

    // Proceed Form logic (if applicable)
    const proceedForm = document.getElementById('proceedForm');
    if (proceedForm) {
        proceedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const proceedPassword = document.getElementById('proceedPassword').value;

            if (proceedPassword === 'password') {
                alert('Request proceeded successfully!');
                window.location.href = 'view-requests.html';
            } else {
                alert('Incorrect password. Please try again.');
            }
        });

        const backBtn = document.getElementById('backBtn');
        backBtn.addEventListener('click', function() {
            window.history.back();
        });
    }
});
