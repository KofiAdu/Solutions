const express = require("express");
const mysql = require("mysql");
const app = express();

//create database
//ideally these will be saved in a separate .env file for security
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "games",
});

//middleware
app.use(express.json()); //allows you to grab the data in json format
app.use(express.urlencoded({ extended: true }));

//endpoints
app.get("/", function (req, res) {
  const selectQuery = "SELECT * FROM gameinfo";

  db.query(selectQuery, function (err, results) {
    if (err) {
      res.status(404).json({ message: err.message });
    } else {
      res.status(200).json({ data: results[0] });
    }
  });
  //res.status(200).json({ message: 'OK' });
});

app.post("/api/add", function (req, res) {
  //getting the request
  const { name, genre, year, rating } = req.body;

  const insertQuery =
    "INSERT INTO gameinfo ( Name, Genre, Year, Rating ) VALUES(?, ?, ?, ?)";

  db.query(insertQuery, [name, genre, year, rating], function (err, results) {
    if (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    } else {
      res.status(200).json({ message: "OK", data: results.data });
    }
  });
});

app.patch("/api/update/:id", function (req, res) {
  const gameID = req.params.id;
  const updatedFields = req.body;

  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ message: "No columns to update provided" });
  }

  const updateQuery = `UPDATE gameinfo SET ? WHERE id = ?`;
  const values = [updatedFields, gameID];

  db.query(updateQuery, values, function (err, results) {
    if (err) {
      console.log(err.message);
      return res.status(500).json({ message: err.message });
    } else {
      res.status(200).json({ message: "Updated" });
    }
  });
});

app.delete("/api/delete/:id", function (req, res) {
  const gameID = req.params.id;
  const deleteQuery = "DELETE FROM gameinfo WHERE id = ?";

  db.query(deleteQuery, gameID, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: "Game deleted successfully" });
    }
  });
});

app.listen(3000, () => console.log("listening on port 3000"));
