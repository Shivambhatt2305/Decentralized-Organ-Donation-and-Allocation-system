create database express_db;
USE express_db;

CREATE TABLE Donor (
    adharnumber VARCHAR(12) PRIMARY KEY,
    fullname VARCHAR(100),
    birthdate DATE,
    gender VARCHAR(10),
    address TEXT,
    contact VARCHAR(10),
    blood_type VARCHAR(3),
    medical_history TEXT,
    consent VARCHAR(10),
    relationname VARCHAR(100),
    relationship VARCHAR(50),
    contactrelation VARCHAR(10),
    consent_relation VARCHAR(10),
	weight DECIMAL(5,2),
	 blood_group VARCHAR(3),
    hospital_name VARCHAR(100),
    time_of_death DATETIME,
    organs VARCHAR(100),
   consent_donor VARCHAR(10),
    consent_family VARCHAR(10),
    donation_urgency VARCHAR(20),
    hospital_address VARCHAR(100)

);

CREATE TABLE Recipient (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital VARCHAR(255) NOT NULL,
    weight DECIMAL(5, 2) NOT NULL,
    blood_group VARCHAR(3) NOT NULL,
    birthdate DATE NOT NULL,
    organs_needed VARCHAR(255),
    donation_urgency VARCHAR(20)
);


CREATE TABLE Hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(100),
    address TEXT,
    contact_number VARCHAR(20),
    available_organs TEXT,
    city VARCHAR(50)
);