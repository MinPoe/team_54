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

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({ data: tableContent });
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, size, colour, shape, pattern } = req.body;
    const insertResult = await appService.insertDemotable(id, size, colour, shape, pattern);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
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
    const queryData = await appService.fetchJoinQuery(minCred);
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

module.exports = router;