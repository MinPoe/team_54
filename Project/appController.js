const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/report-table', async (req, res) => {
    const tableContent = await appService.fetchReportTableFromDb();
    res.json({ data: tableContent });
});

router.post("/initiate-report-table", async (req, res) => {
    const initiateResult = await appService.initiateReportTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-report-table', async (req, res) => {
    const tableCount = await appService.countReportTable();
    if (tableCount >= 0) {
        res.json({
            success: true,
            count: tableCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: tableCount
        });
    }
});

router.post('/insert-join-query', async (req, res) => {
    const {minCred} = req.body;
    const queryData = await appService.fetchJoinQuery(parseInt(minCred));
    if (isNaN(minCred)) {
        return res.status(400).json({
            success: false,
            message: "Credibility Score must be a number"
        });
    }
    if (queryData) {
        res.json({
            success: true,
            data: queryData
        });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/division', async (req, res) => {
    const divResult = await appService.fetchDivision();
    if (divResult) {
        res.json({
            success: true,
            data: divResult
        });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/nested-reporters', async (req, res) => {
    const nestResult = await appService.fetchNestedReporters();
    if (nestResult) {
        res.json({
            success: true,
            data: nestResult
        });
    } else {
        res.status(500).json({ success: false });
    }
});

/* INSERT Report: GET encounter, GET reporter */
router.get('/encounters', async (req, res) => {
    const encounters = await appService.fetchAllEncounters();
    res.json({ data: encounters });
});
 
router.get('/reporters', async (req, res) => {
    const reporters = await appService.fetchAllReporters();
    res.json({ data: reporters });
});

router.post('/insert-report', async (req, res) => {
    const { reportID, encounterID, reporterID, witnessCount, reportStatus, credibilityScore } = req.body;
 
    if (!reportID || !encounterID || !reporterID) {
        return res.status(400).json({ success: false, message: 'Report ID, Encounter ID, and Reporter ID are required.' });
    }
 
    const result = await appService.insertReport(
        parseInt(reportID),
        parseInt(encounterID),
        parseInt(reporterID),
        witnessCount ? parseInt(witnessCount) : null,
        reportStatus || null,
        credibilityScore ? parseInt(credibilityScore) : null
    );
    
    if (result.success) {
        res.json({ success: true, message: result.message });
    } else {
        res.status(400).json({ success: false, message: result.message });
    }
});

/* UPDATE Reporter: GET all reporter tuples */ 
router.get('/reporter-tuples', async (req, res) => {
    const tuples = await appService.fetchAllReporterTuples();
    res.json({ data: tuples });
});

router.post('/update-reporter', async (req, res) => {
    const { reporterID, newName, newAge, newOccupation } = req.body;
 
    if (!reporterID || !newName || !newAge || !newOccupation) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const regexCheckLetters = /^[A-Za-z\s]+$/;

    if (!regexCheckLetters.test(newName)) {
        return res.status(400).json({
            success: false,
            message: "Name must contain only letters or spaces."
        })
    } else if (!newName.trim()) {
        return res.status(400).json({
            success: false,
            message: "Name must contain at least one letter."
        })
    }

    if (!regexCheckLetters.test(newOccupation)) {
        return res.status(400).json({
            success: false,
            message: "Occupation must contain only letters or spaces."
        })
    } else if (!newOccupation.trim()) {
        return res.status(400).json({
            success: false,
            message: "Occupation must contain at least one letter."
        })
    }
 
    const result = await appService.updateReporter(
        parseInt(reporterID),
        newName,
        parseInt(newAge),
        newOccupation
    );
 
    if (result.success) {
        res.json({ success: true, message: result.message });
    } else {
        res.status(400).json({ success: false, message: result.message });
    }
});

/* SELECTION -> UFO */
router.post('/selection-ufo', async (req, res) => {
    const { conditions, groups } = req.body;
    const result = await appService.selectionUFO(conditions, groups);
    if (result.success) {
        res.json({ success: true, data: result.data });
    } else {
        res.status(400).json({ success: false, message: result.message, data: [] });
    }
});

/* GROUP BY -> COUNT(report_ID), GROUP BY 'city' */
router.get('/group-by-city', async (req, res) => {
    const result = await appService.groupByCity();
    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false });
    }
});

/* DELETE -> Encounter */
router.post('/delete-encounter', async (req, res) => {
    const {encounterID} = req.body;
    const result = await appService.deleteEncounter(encounterID);
    if (result) {
        res.json({ success: true, message: `Encounter ${encounterID} deleted successfully!`});
    } else {
        res.status(400).json({
            success: false,
            message: "Failed to delete encounter, not a valid Encounter ID"
        });
    }
});

// PROJECTION
router.post('/projection-location', async (req, res) => {
    const {attributes} = req.body;
    const result = await appService.projectionLocation(attributes);

    if (result) {
        res.json({ success: true, result: result});
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid attributes chosen,"
        });
    }
});

// GROUP BY HAVING TERRAIN
router.post('/group-by-having-terrain', async (req, res) => {
    const { reportCount } = req.body;
    const result = await appService.groupByHavingTerrain(parseInt(reportCount));

    if (isNaN(reportCount)) {
        return res.status(400).json({
            success: false,
            message: "Report count must be a number"
        });
    }

    if (result) {
        res.json({ success: true, data: result });
    } else {
        res.status(500).json({ success: false });
    }
});

module.exports = router;