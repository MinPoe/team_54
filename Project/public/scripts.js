/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the Report table and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('reportTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/report-table', {
        method: 'GET'
    });

    const responseData = await response.json();
    const reportTableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    reportTableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the Report table.
async function resetReportTable() {
    const response = await fetch("/initiate-report-table", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "Report table initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}


// Counts rows in the Report table.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countReportTable() {
    const response = await fetch("/count-report-table", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of Reports: ${tupleCount}`;
    } else {
        alert("Error in count report table!");
    }
}

// Fetches Join Query.
async function fetchJoinQuery(event) {
    event.preventDefault();

    const queryValue = document.getElementById('joinQuery').value;
    const tBody = document.getElementById('fetchJoinTableBody');

    const response = await fetch('/insert-join-query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            minCred: queryValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('fetchQueryMsg');

    if (isNaN(queryValue)) {
        messageElement.textContent = "Please enter a valid number."
        return;
    } else if (queryValue < 0 || queryValue > 10) {
        messageElement.textContent = "Score must be between 0 and 10.";
        return;
    }

    if (responseData.success) {
        messageElement.textContent = "Query Fetched!";
        tBody.innerHTML = "";
        for (const row of responseData.data) {
            const tr = tBody.insertRow();
            const tdID = tr.insertCell();
            tdID.textContent = row[0];
            const tdName = tr.insertCell();
            tdName.textContent = row[1];
            const tdOccupation = tr.insertCell();
            tdOccupation.textContent = row[2];
            const tdCred = tr.insertCell();
            tdCred.textContent = row[3];
        }
    } else {
        messageElement.textContent = "Error Fetching Query!";
    }
}

// Displays Division.
async function displayDivision() {
    const tBody = document.getElementById('divisionBody');

    const response = await fetch('/division', {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('divisionMsg');

    if (responseData.success) {
        tBody.innerHTML = "";
        for (const row of responseData.data) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = row[0];
            tr.appendChild(td);
            tBody.appendChild(tr);
        }
    } else {
        messageElement.textContent = "Error Fetching Query!";
    }
}

// Displays Nest Group By.
async function displayNestedGroupBy() {
    const tBody = document.getElementById('nestedGroupByBody');

    const response = await fetch('/nested-reporters', {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('nestedMsg');

    if (responseData.success) {
        tBody.innerHTML = "";
        for (const row of responseData.data) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = row[0];
            tr.appendChild(td);
            const tdAvg = document.createElement('td');
            tdAvg.textContent = row[1];
            tr.appendChild(tdAvg);
            tBody.appendChild(tr);
        }
    } else {
        messageElement.textContent = "Error Fetching Query!";
    }
}

// ---- INSERT Report (with FK validation) ----
 
// Populate encounter and reporter dropdowns on page load
async function populateInsertReportDropdowns() {
    const encRes = await fetch('/encounters');
    const encData = await encRes.json();
    const encSelect = document.getElementById('insertReportEncounterID');
    encSelect.innerHTML = '<option value="">-- Select Encounter --</option>';
    for (const id of encData.data) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `Encounter ${id}`;
        encSelect.appendChild(opt);
    }
 
    const repRes = await fetch('/reporters');
    const repData = await repRes.json();
    const repSelect = document.getElementById('insertReportReporterID');
    repSelect.innerHTML = '<option value="">-- Select Reporter --</option>';
    for (const row of repData.data) {
        const opt = document.createElement('option');
        opt.value = row[0];
        opt.textContent = `${row[0]} - ${row[1]}`;
        repSelect.appendChild(opt);
    }
}
 
async function insertReport(event) {
    event.preventDefault();
    const msgEl = document.getElementById('insertReportMsg');
 
    const reportID = document.getElementById('insertReportID').value;
    const encounterID = document.getElementById('insertReportEncounterID').value;
    const reporterID = document.getElementById('insertReportReporterID').value;
    const witnessCount = document.getElementById('insertReportWitnessCount').value;
    const reportStatus = document.getElementById('insertReportStatus').value;
    const credibilityScore = document.getElementById('insertReportCredScore').value;
 
    const response = await fetch('/insert-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportID, encounterID, reporterID, witnessCount, reportStatus, credibilityScore })
    });
 
    const data = await response.json();
    msgEl.textContent = data.message;
    msgEl.style.color = data.success ? 'green' : 'red';

    if (data.success) {
        fetchTableData();
    }
}
 
 
// ---- UPDATE Reporter ----
 
async function loadReporterTuples() {
    const res = await fetch('/reporter-tuples');
    const data = await res.json();
    const tbody = document.getElementById('reporterTuplesBody');
    tbody.innerHTML = '';
 
    for (const row of data.data) {
        const tr = document.createElement('tr');
        // row: [reporter_ID, reporter_name, age, occupation, reliability_rating, reporter_address]
        for (const val of row) {
            const td = document.createElement('td');
            td.textContent = val;
            tr.appendChild(td);
        }
        // Add select button
        const tdBtn = document.createElement('td');
        const btn = document.createElement('button');
        btn.textContent = 'Select';
        btn.addEventListener('click', () => {
            document.getElementById('updateReporterID').value = row[0];
            document.getElementById('updateReporterName').value = row[1] || '';
            document.getElementById('updateReporterAge').value = row[2] || '';
            document.getElementById('updateReporterOccupation').value = row[3] || '';
            document.getElementById('updateReporterMsg').textContent = `Editing Reporter ${row[0]}`;
            document.getElementById('updateReporterMsg').style.color = '#333';
        });
        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);
        tbody.appendChild(tr);
    }
}
 
async function updateReporter(event) {
    event.preventDefault();
    const msgEl = document.getElementById('updateReporterMsg');
 
    const reporterID = document.getElementById('updateReporterID').value;
    const newName = document.getElementById('updateReporterName').value;
    const newAge = document.getElementById('updateReporterAge').value;
    const newOccupation = document.getElementById('updateReporterOccupation').value;
 
    if (!reporterID) {
        msgEl.textContent = 'Please select a reporter from the table first.';
        msgEl.style.color = 'red';
        return;
    }
 
    const response = await fetch('/update-reporter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterID, newName, newAge, newOccupation })
    });
 
    const data = await response.json();
    msgEl.textContent = data.message;
    msgEl.style.color = data.success ? 'green' : 'red';
 
    if (data.success) {
        loadReporterTuples(); // refresh the table
    }
}
 
 
// ---- SELECTION UFO (dynamic AND/OR with parentheses) ----
 
let selectionConditions = [];
 
function addSelectionCondition() {
    const container = document.getElementById('selectionConditionsContainer');
    const index = selectionConditions.length;
 
    const condDiv = document.createElement('div');
    condDiv.className = 'selection-condition';
    condDiv.dataset.index = index;
 
    let html = '';
 
    // connector (AND/OR) -- only for conditions after the first
    if (index > 0) {
        html += `
            <select class="sel-connector">
                <option value="AND">AND</option>
                <option value="OR">OR</option>
            </select>
        `;
    }
 
    // open parenthesis checkbox
    html += `<label><input type="checkbox" class="sel-open-paren"> (</label> `;
 
    // attribute dropdown
    html += `
        <select class="sel-attribute">
            <option value="UFO_ID">UFO_ID</option>
            <option value="ufo_size">ufo_size</option>
            <option value="colour">colour</option>
            <option value="shape">shape</option>
            <option value="movement_pattern">movement_pattern</option>
        </select>
        =
        <input type="text" class="sel-value" placeholder="value">
    `;
 
    // close parenthesis checkbox
    html += ` <label><input type="checkbox" class="sel-close-paren">) </label>`;
 
    // remove button
    html += ` <button type="button" class="sel-remove" onclick="removeSelectionCondition(${index})">✕</button>`;
 
    condDiv.innerHTML = html;
    container.appendChild(condDiv);
    selectionConditions.push(condDiv);
}
 
function removeSelectionCondition(index) {
    const container = document.getElementById('selectionConditionsContainer');
    const condDiv = selectionConditions[index];
    if (condDiv) {
        container.removeChild(condDiv);
        selectionConditions[index] = null;
    }
}
 
async function executeSelectionUFO() {
    const msgEl = document.getElementById('selectionUFOMsg');
    const tbody = document.getElementById('selectionUFOBody');
 
    const conditions = [];
    const groups = [];
 
    // gather non-null conditions in order
    let condIndex = 0;
    for (let i = 0; i < selectionConditions.length; i++) {
        const condDiv = selectionConditions[i];
        if (!condDiv) continue;
 
        const attribute = condDiv.querySelector('.sel-attribute').value;
        const value = condDiv.querySelector('.sel-value').value;
        const connectorEl = condDiv.querySelector('.sel-connector');
        const connector = connectorEl ? connectorEl.value : null;
        const openParen = condDiv.querySelector('.sel-open-paren').checked;
        const closeParen = condDiv.querySelector('.sel-close-paren').checked;
 
        if (!value) {
            msgEl.textContent = 'Please fill in all condition values.';
            msgEl.style.color = 'red';
            return;
        }
 
        if (openParen) {
            groups.push({ type: 'open', position: condIndex });
        }
        if (closeParen) {
            groups.push({ type: 'close', position: condIndex });
        }
 
        conditions.push({ attribute, value, connector });
        condIndex++;
    }
 
    const response = await fetch('/selection-ufo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions, groups })
    });
 
    const data = await response.json();
 
    if (data.success) {
        tbody.innerHTML = '';
        if (data.data.length === 0) {
            msgEl.textContent = 'No results found.';
            msgEl.style.color = 'grey';
        } else {
            msgEl.textContent = `${data.data.length} result(s) found.`;
            msgEl.style.color = 'green';
        }
        for (const row of data.data) {
            const tr = document.createElement('tr');
            for (const val of row) {
                const td = document.createElement('td');
                td.textContent = val;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    } else {
        msgEl.textContent = data.message || 'Error executing selection.';
        msgEl.style.color = 'red';
    }
}
 
 
// --- GROUP BY city ----
 
async function displayGroupByCity() {
    const tbody = document.getElementById('groupByCityBody');
    const msgEl = document.getElementById('groupByCityMsg');
 
    const response = await fetch('/group-by-city');
    const data = await response.json();
 
    if (data.success) {
        tbody.innerHTML = '';
        for (const row of data.data) {
            const tr = document.createElement('tr');
            const tdCity = document.createElement('td');
            tdCity.textContent = row[0];
            tr.appendChild(tdCity);
            const tdCount = document.createElement('td');
            tdCount.textContent = row[1];
            tr.appendChild(tdCount);
            tbody.appendChild(tr);
        }
        msgEl.textContent = '';
    } else {
        msgEl.textContent = 'Error fetching group by city data.';
        msgEl.style.color = 'red';
    }
}
 


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetReportTable").addEventListener("click", resetReportTable);
    document.getElementById("countReportTable").addEventListener("click", countReportTable);
    document.getElementById("fetchJoinQuery").addEventListener("submit", fetchJoinQuery);
    document.getElementById("displayDivision").addEventListener("click", displayDivision);
    document.getElementById("displayNestedGroupBy").addEventListener("click", displayNestedGroupBy);
    populateInsertReportDropdowns();
    document.getElementById("insertReportForm").addEventListener("submit", insertReport);
    loadReporterTuples();
    document.getElementById("updateReporterForm").addEventListener("submit", updateReporter);
    document.getElementById("addSelectionCondition").addEventListener("click", addSelectionCondition);
    document.getElementById("executeSelectionUFO").addEventListener("click", executeSelectionUFO);
    document.getElementById("displayGroupByCity").addEventListener("click", displayGroupByCity);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
}