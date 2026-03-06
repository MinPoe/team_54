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
	investigator_name VARCHAR2(100) NOT NULL,
	shared_organizational_email VARCHAR2(150),
	curr_status VARCHAR2(30) NOT NULL,
	PRIMARY KEY (investigator_ID)
);

CREATE TABLE Encounter_Location(
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
	encounter_time CHAR(20),
	weather VARCHAR2(50),
	PRIMARY KEY (encounter_ID),
	FOREIGN KEY (latitude, longitude) REFERENCES Encounter_Location(latitude, longitude)
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
(1, 50, 'white', 'sphere', 'erratic'),
(2, 5, 'black', 'cube', 'straight'),
(30, 12, 'red', 'pyramid', 'erratic'),
(400, 35, 'light-blue', 'cylinder', 'straight'),
(4011, 78, 'green', 'sphere', 'erratic'),;
INSERT INTO Investigator VALUES
(23, 'LeBron James', 'lakers@outlook.com', 'placeholder'),
(77, 'Luka Doncic', 'lakers@outlook.com', 'placeholder'),
(19, 'Bryan Mbeumo', 'united@mail.com', 'placeholder'),
(30, 'Stephen Curry', 'warriors@yahoo.com', 'placeholder'),
(2, 'Shai Gilgeous-Alexander', 'freethrowmerchant@generic.com', 'placeholder'),;
INSERT INTO Encounter_Location VALUES
('49.28128377474540000', '-123.026234321161000', 'Vancouver', 'placeholder', 'Canada'),
('37.56698260000000000', '126.9782352000000000', 'Seoul', 'placeholder', 'South Korea'),
('35.68950600000000000', '139.6917000000000000', 'Tokyo', 'placeholder', 'Japan'),
('49.88633480000000000', '-119.493483600000000', 'Kelowna', 'placeholder', 'Canada'),
('-33.9220161000000000', '18.41958240000000000', 'Cape Town', 'placeholder', 'South Africa'),;
INSERT INTO Encounter VALUES
(1, '49.28128377474540000', '-123.026234321161000', 30, 'Y', '2026-03-05 22:41:00 ', 'rainy'),
(32, '37.56698260000000000', '126.9782352000000000', 120, 'Y', '1999-02-04 09:12:22 ', 'clear'),
(44, '35.68950600000000000', '139.6917000000000000', 5, 'Y', '2025-01-02 13:33:21 ', 'snowy'),
(67, '49.88633480000000000', '-119.493483600000000', 2, 'Y', '2026-02-04 10:10:10 ', 'hail'),
(99, '-33.9220161000000000', '18.41958240000000000', 1, 'Y', '2003-11-07 11:01:07 ', 'clear'),;
INSERT INTO Reporter VALUES
(1, 'Singer', 3, 'Joe Joe', 67, '2045 Corkscrew Blvd, Tokyo, Japan'),
(4, 'Basketball Player', 6, 'Steve Nash', 41, '1111 Rich St, Cape Town, South Africa'),
(35, 'Content Creator', 1, 'Jake Paul', 11, '205 Rotation Blvd, Vancouver, BC, 7FSJIO, Canada'),
(53, 'Teacher', 10, 'Ann Ono', 32, '400-1234 London Rd, Kelowna, BC, 324JLK, Canada'),
(2, 'Pilot', 8, 'Nathan Fielder', 89, '2045 Hello Dr, Seoul, Korea'),;
INSERT INTO Report VALUES
(1, 1, 35, 1, 'Under investigation', 3),
(4, 32, 2, 10, 'Investigation completed', 7),
(3, 44, 1, 100, 'To be investigated', 4),
(30, 67, 53, 30, 'Under investigation', 10),
(40, 99, 4, 15, 'Investigation completed', 1),;
INSERT INTO Conclusion VALUES
(1, 23, '2026-03-06 11:07:07', 'Y', 3),
(2, 77, '2026-03-05 01:07:07', 'N', 5),
(3, 19, '2026-02-06 13:13:07', 'Y', 8),
(4, 30, '2021-03-06 11:12:07', 'N', 1),
(5, 2, '2026-01-06 11:07:12', 'Y', 2),;
-- INSERT statements for relationship tables
INSERT INTO Investigates VALUES
(23, 1),
(77, 4),
(19, 3),
(30, 30),
(2, 40);
INSERT INTO Involves VALUES
(1, 1),
(32, 2),
(44, 30),
(67, 400),
(99, 4011);
INSERT INTO Classifies VALUES
(1, 1, 'placeholder'),
(2, 2, 'placeholder'),
(3, 30, 'placeholder'),
(4, 400, 'placeholder'),
(5, 4011, 'placeholder');
-- INSERT statements for weak entity and subtypes
INSERT INTO Observation VALUES
(1, 1, 30, 'placeholder'),
(4, 2, 30, 'placeholder'),
(3, 3, 30, 'placeholder'),
(30, 4, 30, 'placeholder'),
(40, 5, 30, 'placeholder');
INSERT INTO ResolutionAspect VALUES
('1080x720', '3:2'),
('1920x1080', '16:9'),
('400x400', '1:1'),
('400x200', '2:1'),
('100x800', '1:8');
INSERT INTO Visual VALUES
(1, 1, '1080x720', 3),
(4, 2, '1920x1080', 3),
(3, 3, '400x400', 3),
(30, 4, '400x200', 3),
(40, 5, '100x800', 3);
INSERT INTO Audio VALUES
(1, 1, 30, 20, 'placeholder'),
(4, 2, 30, 20, 'placeholder'),
(3, 3, 30, 20, 'placeholder'),
(30, 4, 30, 20, 'placeholder'),
(40, 5, 30, 20, 'placeholder');
COMMIT;