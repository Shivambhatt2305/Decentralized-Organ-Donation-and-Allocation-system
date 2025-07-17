const express = require("express");
const db = require("../config/db");
const router = express.Router();

router.get("/", (req, res) => res.render("homepage"));
router.get("/login", (req, res) => res.render("login"));
router.get("/recipientForm", (req, res) => res.render("recipientForm"));
router.get("/newDonorRegister", (req, res) => res.render("newDonorRegister"));

router.post("/register", (req, res) => {
  console.log(req.body); // Debugging to ensure data is received correctly

  const {
    adharnumber,
    fullname,
    birthdate,
    gender,
    address,
    contact,
    blood_type,
    medical_history,
    consent,
    relationname,
    relationship,
    contactrelation,
    consent_relation,
  } = req.body;

  // SQL query to insert form data into the database
  const sql = `INSERT INTO Donor (adharnumber, fullname, birthdate, gender, address, contact, blood_type, medical_history, consent, relationname, relationship, contactrelation, consent_relation)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Prepare the values to be inserted
  const values = [
    adharnumber,
    fullname,
    birthdate,
    gender,
    address,
    contact,
    blood_type,
    medical_history,
      consent === 'yes' ? 1 : 0,
    relationname,
    relationship,
    contactrelation,
      consent_relation === 'yes' ? 1 : 0,
  ];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).send("Database insertion failed");
    } else {
      console.log("Data inserted successfully:", result);
      res.send("Registration Successful!");
    }
  });
});


router.post("/authenticateDonor", (req, res) => {
  const { adharnumber } = req.body;

  const sqlDonor = "SELECT * FROM Donor WHERE adharnumber = ?";
  const sqlHospitals = "SELECT hospital_name, address FROM Hospitals"; // Query to get hospital details

  db.query(sqlDonor, [adharnumber], (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).send("Database query failed");
    } 

    // Check if the donor exists
    if (result.length > 0) {
      // Aadhar number found, store it in the session
      req.session.adharnumber = adharnumber;
      console.log("Session stored =", req.session.adharnumber);

      // Now query the Hospitals table to get the list of hospitals
      db.query(sqlHospitals, (err, hospitals) => {
        if (err) {
          console.error("Error querying the hospitals table:", err);
          return res.status(500).send("Failed to fetch hospitals");
        }

        // Render the confirmation page with donor and hospital data
        res.render("donorFinalConfirmation", { 
          donor: result[0],  // Pass the donor data
          hospitals: hospitals // Pass the list of hospitals
        });
      });
    } else {
      // Aadhar number not found, render login page with error message
      res.render("login", {
        errorMessage: "Invalid Aadhar Number. Please try again.",
      });
    }
  });
});

router.post("/submitDonorConfirmation", (req, res) => {
  const {
    weight,
    blood_group,
    hospital,
    time_of_death,
    organs,
    consent_donor,
    consent_family,
    donation_urgency,
    hospital_address
  } = req.body;
  console.log("hiiiiiii =", hospital_address);
  const adharnumber = req.session.adharnumber; // Fetch aadhar number from session

  if (!adharnumber) {
    return res.status(403).send("Unauthorized access. Please log in first.");
  }

  const sql = `UPDATE Donor 
                 SET weight = ?, blood_group = ?, hospital_name = ?, time_of_death = ?, organs = ?, consent_donor = ?, consent_family = ?, donation_urgency = ?,hospital_address = ? 
                 WHERE adharnumber = ?`;

  const values = [
    weight,
    blood_group,
    hospital,
    time_of_death,
    organs.toString(),
    consent_donor === "yes" ? 1 : 0,
    consent_family === "yes" ? 1 : 0,
    donation_urgency,
    hospital_address,
    adharnumber
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating donor details:", err);
      return res.status(500).send("Failed to update donor details");
    }
    res.send("Donor details successfully updated.");
  });
});

router.post("/registerRecipient", (req, res) => {
    const {
      hospital,
      weight,
      blood_group,
      birthdate,
      organs, // array of organs
      donation_urgency
    } = req.body;
  
    const organsNeeded = Array.isArray(organs) ? organs.join(',') : organs;
  
    // SQL query to insert data into Recipient table
    const sqlInsertRecipient = `
      INSERT INTO Recipient (hospital, weight, blood_group, birthdate, organs_needed, donation_urgency)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    const recipientValues = [hospital, weight, blood_group, birthdate, organsNeeded, donation_urgency];
  
    // Insert recipient data into the database
    db.query(sqlInsertRecipient, recipientValues, (err, result) => {
      if (err) {
        console.error("Error inserting recipient data:", err);
        return res.status(500).send("Failed to register recipient");
      }
  
      // Once recipient data is inserted, we fetch matching hospitals from Donor table
      const sqlFetchHospitals = `
        SELECT DISTINCT d.hospital_name, d.organs, d.hospital_address
        FROM Donor d
        WHERE d.blood_group = ?
        AND (
          -- At least one organ must match between recipient and donor
          (FIND_IN_SET('heart', d.organs) > 0 AND FIND_IN_SET('heart', ?) > 0) OR
          (FIND_IN_SET('kidney', d.organs) > 0 AND FIND_IN_SET('kidney', ?) > 0) OR
          (FIND_IN_SET('liver', d.organs) > 0 AND FIND_IN_SET('liver', ?) > 0) OR
          (FIND_IN_SET('lungs', d.organs) > 0 AND FIND_IN_SET('lungs', ?) > 0) OR
          (FIND_IN_SET('pancreas', d.organs) > 0 AND FIND_IN_SET('pancreas', ?) > 0) OR
          (FIND_IN_SET('corneas', d.organs) > 0 AND FIND_IN_SET('corneas', ?) > 0)
        )
      `;
  
      // Execute the query to fetch matching hospitals
      db.query(sqlFetchHospitals, [blood_group, organsNeeded, organsNeeded, organsNeeded, organsNeeded, organsNeeded, organsNeeded], (err, hospitals) => {
        if (err) {
          console.error("Error fetching hospitals:", err);
          return res.status(500).send("Failed to fetch hospitals");
        }
  
        // Render the hospitalsList EJS template with the list of matching hospitals
        res.render("hospitalsList", { hospitals });
      });
    });
  });

  router.get("/map", (req, res) => {
    const { hospital_name, hospital_address } = req.query; // Extract hospital details from query params
  
    // Render the map.ejs page, passing the hospital information to it
    res.render("map", {
      donorHospital: {
        name: hospital_name,
        address: hospital_address,
      }
    });
  });
  
// // Email configuration

// const nodemailer = require("nodemailer");


// // Your existing routes...

// // New route to handle email sending
// router.post("/sendEmail", (req, res) => {
//     const { hospital_name, hospital_address, user_email } = req.body;

//     // Create a transporter object using your email service
//     const transporter = nodemailer.createTransport({
//         service: 'smtp.gmail.com', // Use the email service you want
//         auth: {
//             user: 'aryanpatel1826@gmail.com', // Your email
//             pass: 'iguv ljeq rfbs qxnp' // Your email password or app password
//         }
//     });

//     // Email options
//     const mailOptions = {
//         from: 'aryanrangani123@gmail.com',
//         to: user_email,
//         subject: 'Hospital Booking Confirmation',
//         text: `You have successfully booked with ${hospital_name} located at ${hospital_address}.`
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error("Error sending email:", error);
//             return res.status(500).send("Failed to send email.");
//         }
//         console.log("Email sent:", info.response);
//         res.send("Booking confirmed! A confirmation email has been sent.");
//     });
// });

module.exports = {
  routes: router,
};
