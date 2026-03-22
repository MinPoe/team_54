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

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    fetchJoinQuery,
    fetchDivision,
    fetchNestedReporters
};