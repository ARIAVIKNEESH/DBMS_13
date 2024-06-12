document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('detailsForm');
    const table = document.getElementById('detailsTable').getElementsByTagName('tbody')[0];
    const submitButton = document.getElementById('submitButton');
    let isEditing = false;

    // Fetch existing details on page load
    fetchDetails();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const detail = {
            name: formData.get('name'),
            email: formData.get('email'),
            dob: formData.get('dob'),
            phone_number: formData.get('phone_number'),
            blood_group: formData.get('blood_group')
        };

        if (isEditing) {
            updateDetail(detail);
        } else {
            addDetail(detail);
        }
    });

    function fetchDetails() {
        fetch('http://localhost:5000/details')
        .then(response => response.json())
        .then(data => {
            data.details.forEach(detail => addRowToTable(detail));
        });
    }

    function addDetail(detail) {
        fetch('http://localhost:5000/add', {
            method: 'POST',
            body: new URLSearchParams(detail)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addRowToTable(data.detail);
                form.reset();
            } else {
                alert(data.message);
            }
        });
    }

    function updateDetail(detail) {
        detail.originalEmail = document.getElementById('originalEmail').value;

        fetch('http://localhost:5000/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detail)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const rows = table.rows;
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].cells[1].innerText === detail.originalEmail) {
                        rows[i].cells[0].innerText = detail.name;
                        rows[i].cells[1].innerText = detail.email;
                        rows[i].cells[2].innerText = detail.dob;
                        rows[i].cells[3].innerText = detail.phone_number;
                        rows[i].cells[4].innerText = detail.blood_group;
                        break;
                    }
                }
                form.reset();
                submitButton.innerText = 'Add Detail';
                isEditing = false;
            } else {
                alert(data.message);
            }
        });
    }

    function addRowToTable(detail) {
        const row = table.insertRow();
        row.insertCell(0).innerText = detail.name;
        row.insertCell(1).innerText = detail.email;
        row.insertCell(2).innerText = detail.dob;
        row.insertCell(3).innerText = detail.phone_number;
        row.insertCell(4).innerText = detail.blood_group;
        const actionsCell = row.insertCell(5);
        actionsCell.innerHTML = `
            <button onclick="editDetail(this)">Edit</button>
            <button onclick="deleteDetail(this)">Delete</button>`;
    }

    window.editDetail = function(button) {
        const row = button.parentElement.parentElement;
        document.getElementById('name').value = row.cells[0].innerText;
        document.getElementById('email').value = row.cells[1].innerText;
        document.getElementById('dob').value = row.cells[2].innerText;
        document.getElementById('phone_number').value = row.cells[3].innerText;
        document.getElementById('blood_group').value = row.cells[4].innerText;
        document.getElementById('originalEmail').value = row.cells[1].innerText;
        submitButton.innerText = 'Update Detail';
        isEditing = true;
    };

    window.deleteDetail = function(button) {
        const row = button.parentElement.parentElement;
        const email = row.cells[1].innerText;

        fetch(`http://localhost:5000/delete?email=${email}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                row.remove();
            } else {
                alert(data.message);
            }
        });
    };
});
