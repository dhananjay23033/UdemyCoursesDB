const express = require('express');
const fs = require('fs');
const pg = require('pg');
require('dotenv').config();
const cors = require('cors');

// Database configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUSVWTR6ThWMPdHpisz/+h2fPjl4gwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZTU3MDc4NDMtNmViZS00NDRiLTk1MTItMTA3NDcyZjEy
YzMxIFByb2plY3QgQ0EwHhcNMjQxMTA4MDkwMTUyWhcNMzQxMTA2MDkwMTUyWjA6
MTgwNgYDVQQDDC9lNTcwNzg0My02ZWJlLTQ0NGItOTUxMi0xMDc0NzJmMTJjMzEg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAIpRUATN
SinEN1elRjq5gUb8hWhPJiTMF01R04kNokhFZU9AObF29205gmA5vmwlJP7XzV30
YcId2OzXKnUQw/5ws1ToxcU1U7npxHIXjwdY/s8j9oXpCltLC2qDQMUchwYPPAO5
Auei68iFxgO5IkV+5tufnnZFhFcu4ta3SKXyqD4lh7zkLOqVuceV0yKM+O+XLKpj
OqNS3ePhPoDT5E23JUuEEIeklJz+FwZNJ6Zt3qkEV70J7va6YDPIXYjFrgIUxfQQ
NeAAzX27Ue1bz3F7CimeGrlHkqfQpCCSsy0cRdrkqKsDSpeHXvuLD6CEY2n6O6aR
aTt+wJoVC8AZcIN2mTNq0KAEzOj3c4BfeDwctWwnsGTdHFJ2xp+V/EmmgBebbggY
s2IgHJrMPM1ZoG1d5mq+pdfzQNOhPvCBlPga3VD6mV4ufIw2Vp6D3Bq3qMgL91a4
KZFOdmGa1SJhqcaNQXelQ9KhzP2Vu2mMtNmRLHJ+/zVktXwAJCgBpyXlJQIDAQAB
oz8wPTAdBgNVHQ4EFgQUqbelmodG8OYmEADDamflvB53kGgwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAHEO7X+Z+jec77W9
RvhFmL56tqHue8A379NJATdyDsAgrN+GKjQqK5m0sVUKz5XdYZuYZEHcRNxl4LzF
7JJh2ac9+LUWX2b2XFv6iefCUdVB7TlLelJ+ZfHdCN5qgPeTIouLX7dZboOo7zIF
rPRFfSaw8f7NlOHLrVn6az473sYP23X20k92Yb+MkSMUltbykb61nR4BJcMObkRy
n3GiouBixHjYxw65Qg51cI/xvE8zA8EeaA0rQWLhxLDb2M9CLVsXgtjbPtTaEPAK
eV+a7oUDlKFS4hB6XfCoMpHSxPerT24ygieJNHLmrqg6oeHylqlLLBsE0p6sZjDu
0PTqz9bqTjb/FhdDEklb7KdVxb80AB+XtBG02KFS73+ikv7QNW8v2+9tvReZVKBs
V7J2SBRrh7Rg29smqxLaKYeFKpIePVmPDQuPVLY3giPwtoW/DuTilAFZpkpNMVI+
e6H9HVHswLFqOzvyCL14ShffwmPOsV5yKj+XfdsqVFGEBARI8Q==
-----END CERTIFICATE-----`,
  },
};

// Initialize Express
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Add JSON parsing middleware

// Database connection test
app.get('/test-db', async (req, res) => {
  const client = new pg.Client(config);
  try {
    await client.connect();
    const result = await client.query("SELECT VERSION()");
    res.json({ databaseVersion: result.rows[0].version });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to connect to the database" });
  } finally {
    await client.end();
  }
});

// Count courses
app.get('/count-courses', async (req, res) => {
  const client = new pg.Client(config);
  try {
    await client.connect();
    const result = await client.query('SELECT COUNT(*) AS total FROM Courses');
    res.json({ total: result.rows[0].total });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to query the database' });
  } finally {
    await client.end();
  }
});

// List all courses
app.get('/all-courses', async (req, res) => {
  const client = new pg.Client(config);
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM Courses');
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to query the database' });
  } finally {
    await client.end();
  }
});

// Search for courses
app.get('/search', async (req, res) => {
  const courseName = req.query.courseName;
  if (!courseName || courseName.length > 50) {
    return res.status(400).send({ error: 'Invalid course name' });
  }

  const client = new pg.Client(config);
  try {
    await client.connect();
    const query = `SELECT * FROM Courses WHERE title ILIKE $1`;
    const values = [`%${courseName}%`];
    const result = await client.query(query, values);

    res.send(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send({ error: 'Error fetching data' });
  } finally {
    await client.end();
  }
});

// Search for courses by instructor
app.get('/search-by-instructor', async (req, res) => {
  const instructorName = req.query.instructor;
  if (!instructorName || instructorName.length > 100) {
    return res.status(400).send({ error: 'Invalid instructor name' });
  }

  const client = new pg.Client(config);
  try {
    await client.connect();
    const query = `SELECT * FROM Courses WHERE instructor ILIKE $1`;
    const values = [`%${instructorName}%`];
    const result = await client.query(query, values);

    res.send(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send({ error: 'Error fetching data' });
  } finally {
    await client.end();
  }
});

// Insert a new course
app.post('/courses', async (req, res) => {
  const { 
    title, 
    description, 
    duration, 
    instructor, 
    rating, 
    // Add any other potential fields here
    reviewcount, 
    lectures, 
    level, 
    mrp, 
    discount_percentage, 
    discounted_price 
  } = req.body;

  // Basic validation
  if (!title || title.length > 100 || !description || description.length > 500 || !duration) {
    return res.status(400).send({ error: 'Invalid input' });
  }

  const client = new pg.Client(config);
  try {
    await client.connect();

    // Dynamic query generation to handle all potential fields
    const fields = ['title', 'description', 'duration', 'instructor', 'rating', 
                    'reviewcount', 'lectures', 'level', 'mrp', 
                    'discount_percentage', 'discounted_price'];
    
    // Filter out undefined values
    const validFields = fields.filter(field => req.body[field] !== undefined);
    
    // Create parameterized query
    const query = `
      INSERT INTO Courses (${validFields.join(', ')}) 
      VALUES (${validFields.map((_, i) => `$${i + 1}`).join(', ')}) 
      RETURNING *
    `;

    // Create values array with only defined values
    const values = validFields.map(field => req.body[field]);

    const result = await client.query(query, values);

    res.status(201).send({ course: result.rows[0] });
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).send({ error: 'Error inserting data' });
  } finally {
    await client.end();
  }
});

app.delete('/courses/:id', async (req, res) => {
    const courseId = parseInt(req.params.id, 10); // Parse ID as an integer
  
    // Validate the parsed courseId
    if (isNaN(courseId)) {
      return res.status(400).send({ error: 'Invalid course ID' });
    }
  
    const client = new pg.Client(config);
    try {
      await client.connect();
      const query = `DELETE FROM Courses WHERE courseid = $1 RETURNING *`; // Match the column name `CourseID`
      const values = [courseId];
      const result = await client.query(query, values);
  
      if (result.rowCount === 0) {
        return res.status(404).send({ error: 'Course not found' });
      }
  
      res.send({ message: 'Course deleted successfully', deletedCourse: result.rows[0] });
    } catch (error) {
      console.error('Database delete error:', error);
      res.status(500).send({ error: 'Error deleting data' });
    } finally {
      await client.end();
    }
  });  

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});