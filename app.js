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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});