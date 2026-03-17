#### index.html
### JOIN -> (Report + Reporter)
<table id="insert-join"></table>
<form id="insertJoinQuery">
    WHERE: <input type="text" id="insertWhere" placeholder="Enter Query" required> <br><br>

    <button type="submit"> insert </button> <br>
</form>
<div id="insertQueryMsg"></div>

#### scripts.js
```
async function insertJoinQ(event) {
    event.preventDefault();

    const queryValue = document.getElementById('insertWhere').value;
    const message = document.getElementById('insertQueryMsg');

    const response = await fetch('/insert-join-query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: queryValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertQueryMsg');

    if (responseData.success) {
        fetchTableData();
    } else {
        messageElement.textContent = "Invalid Query!";
    }
}
document.getElementById('insertJoinQuery').addEventListener('submit', insertJoinQ);
```

#### appService.js
```
async function insertJoinQuery(query) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (query) VALUES (:query)`,
            [query],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        console.log("error!");
        return false;
    });
}
```

#### appController.js
router.post("/insert-join-query", async (req, res) => {
    const { query } = req.body;
    const insertResult = await appService.insertJoinQuery(query);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

## index.html


### GROUP BY (Nested) → GROUP BY ‘reporter_ID’, HAVING AVG(Reporter.credibility_score) >= AVG(credibility_score) FROM Report
<button type="button">Get Reporters that make Reports with an average credibility_score higher than the total average credibility_score across the app</button>

### DIVISION → Find UFO shapes spotted in every ‘terrain_type’

## scripts.js

### GROUP BY (Nested) → GROUP BY ‘reporter_ID’, HAVING AVG(Reporter.credibility_score) >= AVG(credibility_score) FROM Report

### DIVISION → Find UFO shapes spotted in every ‘terrain_type’

## appService.js

### GROUP BY (Nested) → GROUP BY ‘reporter_ID’, HAVING AVG(Reporter.credibility_score) >= AVG(credibility_score) FROM Report
GROUP BY r

### DIVISION → Find UFO shapes spotted in every ‘terrain_type’
SELECT shape
FROM UFO U
WHERE NOT EXISTS ((SELECT ))

## appController.js
### GROUP BY (Nested) → GROUP BY ‘reporter_ID’, HAVING AVG(Reporter.credibility_score) >= AVG(credibility_score) FROM Report
router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});
### DIVISION → Find UFO shapes spotted in every ‘terrain_type’
router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});