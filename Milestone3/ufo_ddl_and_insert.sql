<<<<<<< HEAD
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
	latitude NUMBER(20, 17),
	longitude NUMBER(20, 17),
	city VARCHAR2(100),
	terrain_type VARCHAR2(50),
	country VARCHAR2(60),
	PRIMARY KEY (latitude, longitude)
);

CREATE TABLE Encounter(
	encounter_ID INTEGER,
	latitude NUMBER(20, 17),
	longitude NUMBER(20, 17),
	duration INTEGER,
	verified CHAR(1),
	encounter_time TIMESTAMP,
	weather VARCHAR2(50),
	PRIMARY KEY (encounter_ID),
	FOREIGN KEY (latitude, longitude) REFERENCES Encounter_Location(latitude, longitude)
);

CREATE TABLE Reporter(
	reporter_ID INTEGER,
	occupation VARCHAR2(60),
	reliability_rating INTEGER,
	reporter_name VARCHAR2(100),
	age INTEGER,
	reporter_address VARCHAR2(200),
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
	FOREIGN KEY (encounter_ID) REFERENCES Encounter(encounter_ID) ON DELETE CASCADE,
	FOREIGN KEY (reporter_ID) REFERENCES Reporter(reporter_ID)
);

CREATE TABLE Conclusion(
	conclusion_ID INTEGER,
	investigator_ID INTEGER NOT NULL UNIQUE,
	conclusion_date TIMESTAMP,
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
	audio_compression VARCHAR2(20),
	PRIMARY KEY (report_ID, obs_num),
	FOREIGN KEY (report_ID, obs_num) REFERENCES Observation(report_ID, obs_num) ON DELETE CASCADE
);

-- INSERT statements for core entity tables
INSERT INTO UFO VALUES (1, 50, 'white', 'sphere', 'erratic');
INSERT INTO UFO VALUES (2, 5, 'black', 'cube', 'straight');
INSERT INTO UFO VALUES (30, 12, 'red', 'pyramid', 'erratic');
INSERT INTO UFO VALUES (400, 35, 'light-blue', 'cylinder', 'straight');
INSERT INTO UFO VALUES (4011, 78, 'green', 'sphere', 'erratic');

INSERT INTO Investigator VALUES (23, 'LeBron James', 'lakers@outlook.com', 'Retired');
INSERT INTO Investigator VALUES (77, 'Luka Doncic', 'lakers@outlook.com', 'Active');
INSERT INTO Investigator VALUES (19, 'Bryan Mbeumo', 'united@mail.com', 'active');
INSERT INTO Investigator VALUES (30, 'Stephen Curry', 'warriors@yahoo.com', 'inactive');
INSERT INTO Investigator VALUES (2, 'Shai Gilgeous-Alexander', 'freethrowmerchant@generic.com', 'inactive');

INSERT INTO Encounter_Location VALUES (49.2812837747454, -123.026234321161, 'Vancouver', 'Urban', 'Canada');
INSERT INTO Encounter_Location VALUES (37.5669826, 126.97823520, 'Seoul', 'Flat', 'South Korea');
INSERT INTO Encounter_Location VALUES (35.689506, 139.6917, 'Tokyo', 'Mountain', 'Japan');
INSERT INTO Encounter_Location VALUES (49.8863348, -119.4934836, 'Kelowna', 'Mountain', 'Canada');
INSERT INTO Encounter_Location VALUES (-33.9220161, 18.4195824, 'Cape Town', 'Desert', 'South Africa');

INSERT INTO Encounter VALUES (1, 49.2812837747454, -123.026234321161, 30, 'Y', '05-MAR-26 10:41:00 PM', 'rainy');
INSERT INTO Encounter VALUES (32, 37.5669826, 126.97823520, 120, 'N', '04-FEB-99 09:12:22 AM', 'clear');
INSERT INTO Encounter VALUES (44, 35.689506, 139.6917, 5, 'Y', '02-JAN-25 01:33:21 PM', 'snowy');
INSERT INTO Encounter VALUES (67, 49.8863348, -119.4934836, 2, 'N', '04-FEB-26 10:10:10 AM', 'hail');
INSERT INTO Encounter VALUES (99, -33.9220161, 18.4195824, 1, 'Y', '07-NOV-03 11:01:07 AM', 'clear');

INSERT INTO Reporter VALUES (1, 'Singer', 3, 'Joe Joe', 67, '2045 Corkscrew Blvd, Tokyo, Japan');
INSERT INTO Reporter VALUES (4, 'Basketball Player', 6, 'Steve Nash', 41, '1111 Rich St, Cape Town, South Africa');
INSERT INTO Reporter VALUES (35, 'Content Creator', 1, 'Jake Paul', 11, '205 Rotation Blvd, Vancouver, BC, 7FSJIO, Canada');
INSERT INTO Reporter VALUES (53, 'Teacher', 10, 'Ann Ono', 32, '400-1234 London Rd, Kelowna, BC, 324JLK, Canada');
INSERT INTO Reporter VALUES (2, 'Pilot', 8, 'Nathan Fielder', 89, '2045 Hello Dr, Seoul, Korea');

INSERT INTO Report VALUES (1, 1, 35, 1, 'Under investigation', 3);
INSERT INTO Report VALUES (4, 32, 2, 10, 'Investigation completed', 7);
INSERT INTO Report VALUES (3, 44, 1, 100, 'To be investigated', 4);
INSERT INTO Report VALUES (30, 67, 53, 30, 'Under investigation', 10);
INSERT INTO Report VALUES (40, 99, 4, 15, 'Investigation completed', 1);

INSERT INTO Conclusion VALUES (1, 23, '06-MAR-26 11:07:07 AM', 'Y', 3);
INSERT INTO Conclusion VALUES (2, 77, '05-MAR-26 01:07:07 AM', 'N', 5);
INSERT INTO Conclusion VALUES (3, 19, '06-FEB-26 01:13:07 PM', 'Y', 8);
INSERT INTO Conclusion VALUES (4, 30, '06-MAR-21 11:12:07 AM', 'N', 1);
INSERT INTO Conclusion VALUES (5, 2, '06-JAN-26 11:07:12 AM', 'Y', 2);
-- INSERT statements for relationship tables
INSERT INTO Investigates VALUES (23, 1);
INSERT INTO Investigates VALUES (77, 4);
INSERT INTO Investigates VALUES (19, 3);
INSERT INTO Investigates VALUES (30, 30);
INSERT INTO Investigates VALUES (2, 40);

INSERT INTO Involves VALUES (1, 1);
INSERT INTO Involves VALUES (32, 2);
INSERT INTO Involves VALUES (44, 30);
INSERT INTO Involves VALUES (67, 400);
INSERT INTO Involves VALUES (99, 4011);

INSERT INTO Classifies VALUES (1, 1, 'Civil Aircraft');
INSERT INTO Classifies VALUES (2, 2, 'Meteor');
INSERT INTO Classifies VALUES (3, 30, 'Unidentified');
INSERT INTO Classifies VALUES (4, 400, 'Spaceship');
INSERT INTO Classifies VALUES (5, 4011, 'Weather Balloon');
-- INSERT statements for weak entity and subtypes
INSERT INTO Observation VALUES (1, 1, 30, 'MP4');
INSERT INTO Observation VALUES (4, 2, 30, 'MOV');
INSERT INTO Observation VALUES (3, 3, 30, 'AVI');
INSERT INTO Observation VALUES (30, 4, 30, 'WMV');
INSERT INTO Observation VALUES (40, 5, 30, 'MKV');

INSERT INTO ResolutionAspect VALUES ('1080x720', '3:2');
INSERT INTO ResolutionAspect VALUES ('1920x1080', '16:9');
INSERT INTO ResolutionAspect VALUES ('400x400', '1:1');
INSERT INTO ResolutionAspect VALUES ('400x200', '2:1');
INSERT INTO ResolutionAspect VALUES ('100x800', '1:8');

INSERT INTO Visual VALUES (1, 1, '1080x720', 1);
INSERT INTO Visual VALUES (4, 2, '1920x1080', 8);
INSERT INTO Visual VALUES (3, 3, '400x400', 16);
INSERT INTO Visual VALUES (30, 4, '400x200', 24);
INSERT INTO Visual VALUES (40, 5, '100x800', 48);

INSERT INTO Audio VALUES (1, 1, 30, 20, 'Lossy');
INSERT INTO Audio VALUES (4, 2, 30, 20, 'Lossless');
INSERT INTO Audio VALUES (3, 3, 30, 20, 'Lossless');
INSERT INTO Audio VALUES (30, 4, 30, 20, 'Lossy');
INSERT INTO Audio VALUES (40, 5, 30, 20, 'Lossless');
=======
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
	latitude NUMBER(20, 17),
	longitude NUMBER(20, 17),
	city VARCHAR2(100),
	terrain_type VARCHAR2(50),
	country VARCHAR2(60),
	PRIMARY KEY (latitude, longitude)
);

CREATE TABLE Encounter(
	encounter_ID INTEGER,
	latitude NUMBER(20, 17),
	longitude NUMBER(20, 17),
	duration INTEGER,
	verified CHAR(1),
	encounter_time TIMESTAMP,
	weather VARCHAR2(50),
	PRIMARY KEY (encounter_ID),
	FOREIGN KEY (latitude, longitude) REFERENCES Encounter_Location(latitude, longitude)
);

CREATE TABLE Reporter(
	reporter_ID INTEGER,
	occupation VARCHAR2(60),
	reliability_rating INTEGER,
	reporter_name VARCHAR2(100),
	age INTEGER,
	reporter_address VARCHAR2(200),
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
	conclusion_date TIMESTAMP,
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
	audio_compression VARCHAR2(20),
	PRIMARY KEY (report_ID, obs_num),
	FOREIGN KEY (report_ID, obs_num) REFERENCES Observation(report_ID, obs_num) ON DELETE CASCADE
);

-- INSERT statements for core entity tables
INSERT INTO UFO VALUES (1, 50, 'white', 'sphere', 'erratic');
INSERT INTO UFO VALUES (2, 5, 'black', 'cube', 'straight');
INSERT INTO UFO VALUES (30, 12, 'red', 'pyramid', 'erratic');
INSERT INTO UFO VALUES (400, 35, 'light-blue', 'cylinder', 'straight');
INSERT INTO UFO VALUES (4011, 78, 'green', 'sphere', 'erratic');

INSERT INTO Investigator VALUES (23, 'LeBron James', 'lakers@outlook.com', 'Retired');
INSERT INTO Investigator VALUES (77, 'Luka Doncic', 'lakers@outlook.com', 'Active');
INSERT INTO Investigator VALUES (19, 'Bryan Mbeumo', 'united@mail.com', 'active');
INSERT INTO Investigator VALUES (30, 'Stephen Curry', 'warriors@yahoo.com', 'inactive');
INSERT INTO Investigator VALUES (2, 'Shai Gilgeous-Alexander', 'freethrowmerchant@generic.com', 'inactive');

INSERT INTO Encounter_Location VALUES (49.2812837747454, -123.026234321161, 'Vancouver', 'Urban', 'Canada');
INSERT INTO Encounter_Location VALUES (37.5669826, 126.97823520, 'Seoul', 'Flat', 'South Korea');
INSERT INTO Encounter_Location VALUES (35.689506, 139.6917, 'Tokyo', 'Mountain', 'Japan');
INSERT INTO Encounter_Location VALUES (49.8863348, -119.4934836, 'Kelowna', 'Mountain', 'Canada');
INSERT INTO Encounter_Location VALUES (-33.9220161, 18.4195824, 'Cape Town', 'Desert', 'South Africa');

INSERT INTO Encounter VALUES (1, 49.2812837747454, -123.026234321161, 30, 'Y', '05-MAR-26 10:41:00 PM', 'rainy');
INSERT INTO Encounter VALUES (32, 37.5669826, 126.97823520, 120, 'N', '04-FEB-99 09:12:22 AM', 'clear');
INSERT INTO Encounter VALUES (44, 35.689506, 139.6917, 5, 'Y', '02-JAN-25 01:33:21 PM', 'snowy');
INSERT INTO Encounter VALUES (67, 49.8863348, -119.4934836, 2, 'N', '04-FEB-26 10:10:10 AM', 'hail');
INSERT INTO Encounter VALUES (99, -33.9220161, 18.4195824, 1, 'Y', '07-NOV-03 11:01:07 AM', 'clear');

INSERT INTO Reporter VALUES (1, 'Singer', 3, 'Joe Joe', 67, '2045 Corkscrew Blvd, Tokyo, Japan');
INSERT INTO Reporter VALUES (4, 'Basketball Player', 6, 'Steve Nash', 41, '1111 Rich St, Cape Town, South Africa');
INSERT INTO Reporter VALUES (35, 'Content Creator', 1, 'Jake Paul', 11, '205 Rotation Blvd, Vancouver, BC, 7FSJIO, Canada');
INSERT INTO Reporter VALUES (53, 'Teacher', 10, 'Ann Ono', 32, '400-1234 London Rd, Kelowna, BC, 324JLK, Canada');
INSERT INTO Reporter VALUES (2, 'Pilot', 8, 'Nathan Fielder', 89, '2045 Hello Dr, Seoul, Korea');

INSERT INTO Report VALUES (1, 1, 35, 1, 'Under investigation', 3);
INSERT INTO Report VALUES (4, 32, 2, 10, 'Investigation completed', 7);
INSERT INTO Report VALUES (3, 44, 1, 100, 'To be investigated', 4);
INSERT INTO Report VALUES (30, 67, 53, 30, 'Under investigation', 10);
INSERT INTO Report VALUES (40, 99, 4, 15, 'Investigation completed', 1);

INSERT INTO Conclusion VALUES (1, 23, '06-MAR-26 11:07:07 AM', 'Y', 3);
INSERT INTO Conclusion VALUES (2, 77, '05-MAR-26 01:07:07 AM', 'N', 5);
INSERT INTO Conclusion VALUES (3, 19, '06-FEB-26 01:13:07 PM', 'Y', 8);
INSERT INTO Conclusion VALUES (4, 30, '06-MAR-21 11:12:07 AM', 'N', 1);
INSERT INTO Conclusion VALUES (5, 2, '06-JAN-26 11:07:12 AM', 'Y', 2);
-- INSERT statements for relationship tables
INSERT INTO Investigates VALUES (23, 1);
INSERT INTO Investigates VALUES (77, 4);
INSERT INTO Investigates VALUES (19, 3);
INSERT INTO Investigates VALUES (30, 30);
INSERT INTO Investigates VALUES (2, 40);

INSERT INTO Involves VALUES (1, 1);
INSERT INTO Involves VALUES (32, 2);
INSERT INTO Involves VALUES (44, 30);
INSERT INTO Involves VALUES (67, 400);
INSERT INTO Involves VALUES (99, 4011);

INSERT INTO Classifies VALUES (1, 1, 'Civil Aircraft');
INSERT INTO Classifies VALUES (2, 2, 'Meteor');
INSERT INTO Classifies VALUES (3, 30, 'Unidentified');
INSERT INTO Classifies VALUES (4, 400, 'Spaceship');
INSERT INTO Classifies VALUES (5, 4011, 'Weather Balloon');
-- INSERT statements for weak entity and subtypes
INSERT INTO Observation VALUES (1, 1, 30, 'MP4');
INSERT INTO Observation VALUES (4, 2, 30, 'MOV');
INSERT INTO Observation VALUES (3, 3, 30, 'AVI');
INSERT INTO Observation VALUES (30, 4, 30, 'WMV');
INSERT INTO Observation VALUES (40, 5, 30, 'MKV');

INSERT INTO ResolutionAspect VALUES ('1080x720', '3:2');
INSERT INTO ResolutionAspect VALUES ('1920x1080', '16:9');
INSERT INTO ResolutionAspect VALUES ('400x400', '1:1');
INSERT INTO ResolutionAspect VALUES ('400x200', '2:1');
INSERT INTO ResolutionAspect VALUES ('100x800', '1:8');

INSERT INTO Visual VALUES (1, 1, '1080x720', 1);
INSERT INTO Visual VALUES (4, 2, '1920x1080', 8);
INSERT INTO Visual VALUES (3, 3, '400x400', 16);
INSERT INTO Visual VALUES (30, 4, '400x200', 24);
INSERT INTO Visual VALUES (40, 5, '100x800', 48);

INSERT INTO Audio VALUES (1, 1, 30, 20, 'Lossy');
INSERT INTO Audio VALUES (4, 2, 30, 20, 'Lossless');
INSERT INTO Audio VALUES (3, 3, 30, 20, 'Lossless');
INSERT INTO Audio VALUES (30, 4, 30, 20, 'Lossy');
INSERT INTO Audio VALUES (40, 5, 30, 20, 'Lossless');
>>>>>>> 549dee9daff6719dfea0bcd7e6ea3e6295ade8b3
COMMIT;