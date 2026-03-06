-- Core entity tables

CREATE TABLE UFO(
	UFO_ID INTEGER,
	ufo_size INTEGER,
	colour VARCHAR2(30),
	shape VARCHAR2(30),
	movement_pattern VARCHAR2(50),
	PRIMARY KEY (UFO_ID)
);

CREATE TABLE Investigator(
	investigator_ID INTEGER,
	name VARCHAR2(100) NOT NULL,
	shared_organizational_email VARCHAR2(150),
	status VARCHAR2(30) NOT NULL,
	PRIMARY KEY (investigator_ID)
);

CREATE TABLE Location(
	latitude CHAR(20),
	longitude CHAR(20),
	city VARCHAR2(100),
	terrain_type VARCHAR2(50),
	country VARCHAR2(60),
	PRIMARY KEY (latitude, longitude)
);

CREATE TABLE Encounter(
	encounter_ID INTEGER,
	latitude CHAR(20),
	longitude CHAR(20),
	duration INTEGER,
	verified CHAR(1),
	time CHAR(20),
	weather VARCHAR2(50),
	PRIMARY KEY (encounter_ID),
	FOREIGN KEY (latitude, longitude) REFERENCES Location(latitude, longitude)
);

CREATE TABLE Reporter(
	reporter_ID INTEGER,
	occupation VARCHAR2(60),
	reliability_rating INTEGER,
	name VARCHAR2(100),
	age INTEGER,
	address VARCHAR2(200),
	PRIMARY KEY (reporter_ID)
);

CREATE TABLE Report(
	report_ID INTEGER,
	encounter_ID INTEGER NOT NULL,
	reporter_ID INTEGER NOT NULL,
	witness_count INTEGER,
	report_status CHAR(40),
	credibility_score INTEGER,
	PRIMARY KEY (report_ID),
	FOREIGN KEY (encounter_ID) REFERENCES Encounter(encounter_ID),
	FOREIGN KEY (reporter_ID) REFERENCES Reporter(reporter_ID)
);

CREATE TABLE Conclusion(
	conclusion_ID INTEGER,
	investigator_ID INTEGER NOT NULL UNIQUE,
	conclusion_date CHAR(20),
	verified CHAR(1),
	confidence_level INTEGER,
	PRIMARY KEY (conclusion_ID),
	FOREIGN KEY (investigator_ID) REFERENCES Investigator(investigator_ID)
);

-- Relationship tables

CREATE TABLE Investigates(
	investigator_ID INTEGER NOT NULL,
	report_ID INTEGER NOT NULL,
	PRIMARY KEY (investigator_ID, report_ID),
	FOREIGN KEY (investigator_ID) REFERENCES Investigator(investigator_ID) ON DELETE CASCADE,
	FOREIGN KEY (report_ID) REFERENCES Report(report_ID) ON DELETE CASCADE
);

CREATE TABLE Involves(
	encounter_ID INTEGER,
	UFO_ID INTEGER,
	PRIMARY KEY (encounter_ID, UFO_ID),
	FOREIGN KEY (encounter_ID) REFERENCES Encounter(encounter_ID) ON DELETE CASCADE,
	FOREIGN KEY (UFO_ID) REFERENCES UFO(UFO_ID) ON DELETE CASCADE
);

CREATE TABLE Classifies(
	conclusion_ID INTEGER NOT NULL,
	UFO_ID INTEGER NOT NULL,
	classification VARCHAR2(50),
	PRIMARY KEY (conclusion_ID, UFO_ID),
	UNIQUE (conclusion_ID),
	UNIQUE (UFO_ID),
	FOREIGN KEY (conclusion_ID) REFERENCES Conclusion(conclusion_ID) ON DELETE CASCADE,
	FOREIGN KEY (UFO_ID) REFERENCES UFO(UFO_ID) ON DELETE CASCADE
);

-- Weak entity and subtypes

CREATE TABLE Observation(
	report_ID INTEGER,
	obs_num INTEGER,
	bitrate INTEGER,
	format VARCHAR2(20),
	PRIMARY KEY (report_ID, obs_num),
	FOREIGN KEY (report_ID) REFERENCES Report(report_ID) ON DELETE CASCADE
);

CREATE TABLE ResolutionAspect(
	resolution VARCHAR2(30),
	aspect_ratio VARCHAR2(20),
	PRIMARY KEY (resolution)
);

CREATE TABLE Visual(
	report_ID INTEGER,
	obs_num INTEGER,
	resolution VARCHAR2(30),
	colour_depth INTEGER,
	PRIMARY KEY (report_ID, obs_num),
	FOREIGN KEY (report_ID, obs_num) REFERENCES Observation(report_ID, obs_num) ON DELETE CASCADE,
	FOREIGN KEY (resolution) REFERENCES ResolutionAspect(resolution)
);

CREATE TABLE Audio(
	report_ID INTEGER,
	obs_num INTEGER,
	frequency INTEGER,
	channels INTEGER,
	compression VARCHAR2(20),
	PRIMARY KEY (report_ID, obs_num),
	FOREIGN KEY (report_ID, obs_num) REFERENCES Observation(report_ID, obs_num) ON DELETE CASCADE
);

-- INSERT statements for core entity tables
INSERT INTO UFO VALUES
(),
(),
(),
(),
(),;
INSERT INTO Investigator VALUES
(),
(),
(),
(),
(),;
INSERT INTO Location VALUES
(),
(),
(),
(),
(),;
INSERT INTO Encounter VALUES
(),
(),
(),
(),
(),;
INSERT INTO Reporter VALUES
(),
(),
(),
(),
(),;
INSERT INTO Report VALUES
(),
(),
(),
(),
(),;
INSERT INTO Conclusion VALUES
(),
(),
(),
(),
(),;
-- INSERT statements for relationship tables
INSERT INTO Investigates VALUES
(),
(),
(),
(),
(),;
INSERT INTO Involves VALUES
(),
(),
(),
(),
(),;
INSERT INTO Classifies VALUES
(),
(),
(),
(),
(),;
-- INSERT statements for weak entity and subtypes
INSERT INTO Observation VALUES
(),
(),
(),
(),
(),;
INSERT INTO ResolutionAspect VALUES
(),
(),
(),
(),
(),;
INSERT INTO Visual VALUES
(),
(),
(),
(),
(),;
INSERT INTO Audio VALUES
(),
(),
(),
(),
(),;
COMMIT;