const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');
const fs = require('fs');
const path = require('path');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM UFO');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        const filePath = path.join(__dirname, 'sql', 'ufo_ddl_and_insert.sql');
        const ufoSQL = fs.readFileSync(filePath, 'utf8');
        const semicolonremoveUFOStatements = ufoSQL.split(';');
        const trimUFOStatements = semicolonremoveUFOStatements.map(s => s.trim());
        const ufoStatements = trimUFOStatements.filter(s => s.length > 0);
        
        for (const ufoStatement of ufoStatements) {
            try {
                await connection.execute(ufoStatement, [], {autoCommit: true});
            } catch (error) {
                if (error.message.includes("ORA-00942")) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, size, colour, shape, pattern) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO UFO (UFO_ID, ufo_size, colour, shape, movement_pattern) VALUES (:UFO_ID, :ufo_size, :colour, :shape, :movement_pattern)`,
            [id, size, colour, shape, pattern],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE UFO SET colour=:newName where colour=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM UFO');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

async function fetchJoinQuery(minCredibility) {
    return await withOracleDB(async (connection) => {
        const joinStatement = `
            SELECT r.report_ID, rt.reporter_name, rt.occupation, r.credibility_score
            FROM Reporter rt LEFT OUTER JOIN Report r ON rt.reporter_ID = r.reporter_ID
            WHERE r.credibility_score >= :minCred OR r.credibility_score IS NULL
        `;

        const results = await connection.execute(joinStatement, [minCredibility]);
        return results.rows;
    }).catch(() => {
        return false;
    });
}

async function fetchDivision() {
    return await withOracleDB(async (connection) => {
        const joinStatement = `
            SELECT DISTINCT u.shape
            FROM UFO u
            WHERE NOT EXISTS (
                (SELECT l.terrain_type
                FROM Encounter_Location l)
                MINUS
                (SELECT ll.terrain_type
                 FROM UFO u1, Involves i, Encounter e, Encounter_Location ll
                 WHERE u1.UFO_ID = i.UFO_ID
                 AND i.encounter_ID = e.encounter_ID
                 AND e.latitude = ll.latitude
                 AND e.longitude = ll.longitude
                 AND u.shape = u1.shape)
            )
        `;

        const results = await connection.execute(joinStatement);
        return results.rows;
    }).catch(() => {
        return false;
    });
}

async function fetchNestedReporters() {
    return await withOracleDB(async (connection) => {
        const nestedStatement = `
           SELECT r1.reporter_ID, AVG(r1.credibility_score) AS AVGSCORE
           FROM Report r1
           GROUP BY r1.reporter_ID
           HAVING AVG(credibility_score) >= (
                SELECT AVG(avg_score)
                FROM (
                    SELECT AVG(r2.credibility_score) AS avg_score
                    FROM Report r2
                    GROUP BY r2.report_ID 
                )
           ) 
        `
        const results = await connection.execute(nestedStatement);
        return results.rows;
    }).catch(() => {
        return false;
    });
} 

/* ----------- Query: INSERT -> Reporter ----------- */ 
async function fetchAllEncounters() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT encounter_ID FROM Encounter ORDER BY encounter_ID');
        return result.rows.map(r => r[0]);
    }).catch(() => {
        return [];
    });
}

async function fetchAllReporters() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT reporter_ID, reporter_name FROM Reporter ORDER BY reporter_ID');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function insertReport(reportID, encounterID, reporterID, witnessCount, reportStatus, credibilityScore) {
    return await withOracleDB(async (connection) => {
        /* encounter_id FK Check */
        const encounteridCheck = await connection.execute(
            'SELECT COUNT(*) FROM Encounter WHERE encounter_ID = :id', [encounterID]
        );
        if (encounteridCheck.rows[0][0] === 0) {
            return { success: false, message: `Encounter ID ${encounterID} does not exist.` };
        }

        /* reporter_id FK Check */ 
        const repCheck = await connection.execute(
            'SELECT COUNT(*) FROM Reporter WHERE reporter_ID = :id', [reporterID]
        );
        if (repCheck.rows[0][0] === 0) {
            return { success: false, message: `Reporter ID ${reporterID} does not exist.` };
        }
        
        /* duplicate PK check */
        const pkCheck = await connection.execute(
            'SELECT COUNT(*) FROM Report WHERE report_ID = :id', [reportID]
        );
        if (pkCheck.rows[0][0] > 0) {
            return { success: false, message: `Report ID ${reportID} already exists.` };
        }

        const query =  `INSERT INTO Report (report_ID, encounter_ID, reporter_ID, witness_count, report_status, credibility_score)
                        VALUES (:report_ID, :encounter_ID, :reporter_ID, :witness_count, :report_status, :credibility_score)`; 

        const result = await connection.execute(
            query, 
            [reportID, encounterID, reporterID, witnessCount, reportStatus, credibilityScore],
            { autoCommit: true }
        );

        if (result.rowsAffected && result.rowsAffected > 0) {
            return { success: true, message: 'Report inserted successfully!' };
        } else {
            return { success: false, message: 'Insert failed — no rows affected.' };
        }
        }).catch((err) => {
            return { success: false, message: 'Database error: ' + err.message };
    });
}

/* ----------- Section: UPDATE -> Reporter ----------- */ 
async function fetchAllReporterTuples() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'SELECT reporter_ID, reporter_name, age, occupation, reliability_rating, reporter_address FROM Reporter ORDER BY reporter_ID'
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}
 
/* UPDATE -> Reporter: 
 *      3 non-PKs: name, age, occupation
 *      1 non-PK UNIQUE: name
*/
async function updateReporter(reporterID, newName, newAge, newOccupation) {
    return await withOracleDB(async (connection) => {
        const reporterCheck = await connection.execute(
            'SELECT COUNT(*) FROM Reporter WHERE reporter_ID = :id', [reporterID]
        );
        if (reporterCheck.rows[0][0] === 0) {
            return { success: false, message: `Reporter ID ${reporterID} not found.` };
        }

        const nameCheck = await connection.execute(
            'SELECT COUNT(*) FROM Reporter WHERE reporter_name = :name AND reporter_ID != :id', 
            [newName, reporterID]
        );
        if (nameCheck.rows[0][0] > 0) {
            return { success: false, message: `Name "${newName}" is already taken by another reporter.` };
        }
 
        const result = await connection.execute(
            `UPDATE Reporter 
             SET reporter_name = :newName, age = :newAge, occupation = :newOccupation
             WHERE reporter_ID = :reporterID`,
            [newName, newAge, newOccupation, reporterID],
            { autoCommit: true }
        );
 
        if (result.rowsAffected && result.rowsAffected > 0) {
            return { success: true, message: 'Reporter updated successfully!' };
        } else {
            return { success: false, message: 'Update failed.' };
        }
    }).catch((err) => {
        return { success: false, message: 'Database error: ' + err.message };
    });
}
 
/* Query: SELECTION -> UFO
    conditions - array of { attribute, value, connector }
    connector - 'AND' | 'OR' | null (for first condition)
    groups - array of { type: 'open'|'close', position: number } for parentheses
*/
async function selectionUFO(conditions, groups) {
    return await withOracleDB(async (connection) => {
        if (!conditions || conditions.length === 0) {
            // no conditions, return all
            const result = await connection.execute('SELECT * FROM UFO');
            return { success: true, data: result.rows };
        }
 
        const validAttributes = ['UFO_ID', 'ufo_size', 'colour', 'shape', 'movement_pattern'];
        let whereClause = '';
        const bindParams = {};
 
        for (let i = 0; i < conditions.length; i++) {
            const cond = conditions[i];
            
            // validate attribute names
            if (!validAttributes.includes(cond.attribute)) {
                return { success: false, message: `Invalid attribute: ${cond.attribute}`, data: [] };
            }
 
            // add connector (AND/OR) for conditions after the first
            if (i > 0 && cond.connector) {
                const conn = cond.connector.toUpperCase();
                if (conn !== 'AND' && conn !== 'OR') {
                    return { success: false, message: `Invalid connector: ${cond.connector}`, data: [] };
                }
                whereClause += ` ${conn} `;
            }
 
            // check for open parentheses at this position
            if (groups) {
                for (const g of groups) {
                    if (g.type === 'open' && g.position === i) {
                        whereClause += '(';
                    }
                }
            }
 
            const bindKey = `val${i}`;
            // use numeric comparison for numeric attributes
            if (cond.attribute === 'UFO_ID' || cond.attribute === 'ufo_size') {
                whereClause += `${cond.attribute} = :${bindKey}`;
                bindParams[bindKey] = parseInt(cond.value);
            } else {
                whereClause += `${cond.attribute} = :${bindKey}`;
                bindParams[bindKey] = cond.value;
            }
 
            // check for close parentheses after this position
            if (groups) {
                for (const g of groups) {
                    if (g.type === 'close' && g.position === i) {
                        whereClause += ')';
                    }
                }
            }
        }
 
        const sql = `SELECT * FROM UFO WHERE ${whereClause}`;
        console.log('Selection SQL:', sql, 'Binds:', bindParams);
 
        const result = await connection.execute(sql, bindParams);
        return { success: true, data: result.rows };
    }).catch((err) => {
        return { success: false, message: 'Database error: ' + err.message, data: [] };
    });
}
 
 
// Query: GROUP BY -> COUNT(report_ID) GROUP BY city 
 
async function groupByCity() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT el.city, COUNT(r.report_ID) AS report_count
            FROM Encounter_Location el
            JOIN Encounter e ON el.latitude = e.latitude AND el.longitude = e.longitude
            JOIN Report r ON e.encounter_ID = r.encounter_ID
            GROUP BY el.city
            ORDER BY report_count DESC
        `;
        const result = await connection.execute(query);
        return result.rows;
    }).catch(() => {
        return false;
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    fetchJoinQuery,
    fetchDivision,
    fetchNestedReporters,
    fetchAllEncounters,
    fetchAllReporters,
    insertReport,
    fetchAllReporterTuples,
    updateReporter,
    selectionUFO,
    groupByCity
};