const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "12345";
const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//auth middleware
const auth = (req, res, next) => {
  //setting token as a header
  const token = req.header("Authorization");

  //checking if token exists
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    req.id = decoded.ID;
    next();
  });
};

//database connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "people",
});

//register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if any of the required fields are missing
  if (!username || !password) {
    return res.status(404).json({ message: "All fields are required" });
  }

  const insertQuery = "INSERT INTO users (Username, Password) VALUES (?, ?)";

  // Hash the user's password
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(insertQuery, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    res.json({ user: username });
  });
});

//login
app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    const selectName = "SELECT * FROM users WHERE username = ?";

    // Check if email and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    db.query(selectName, [username], (err, result) => {
      if (err) {
        console.error(err.stack);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result[0];
      console.log(user);

      //compare password with hashedPassword
      bcrypt.compare(password, user.Password, (err, isMatch) => {
        if (err) return res.status(500).json({ message: err.message });

        if (!isMatch)
          return res.status(401).json({ message: "Invalid email or password" });

        // Generate a JWT token for the newly registered user
        const token = jwt.sign(
          { ID: user.ID, username: user.username },
          secretKey,
          { expiresIn: "2h" }
        );

        //console.log(token);
        //req.id = user.ID;
        //console.log(req.id);
        res.json({ user: username, token });
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get data
app.get("/api/details", auth, (req, res) => {
  const selectQuery =
    "SELECT details.* FROM details INNER JOIN users ON details.userID = ?";
  const userID = req.id;

  db.query(selectQuery, [userID], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    } else {
      res.status(200).json({ message: "Done", data: results });
    }
  });
});

//add data
app.post("/api/add", auth, (req, res) => {
  //destructuring input data
  const {
    fullname,
    favouriteCountry,
    favouriteTeam,
    favouritePlayer,
    favouriteCoach,
  } = req.body;

  //getting user id from token
  const userID = req.id;

  console.log("userID: ", userID);
  //insert query
  const insertQuery =
    "INSERT INTO details (UserID, FullName, FavouriteCountry, FavouriteTeam, FavouritePlayer, FavouriteCoach) VALUES (?, ?, ?, ?, ?, ?)";

  //storing data in array
  const values = [
    userID,
    fullname,
    favouriteCountry,
    favouriteTeam,
    favouritePlayer,
    favouriteCoach,
  ];

  db.query(insertQuery, values, (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      res
        .status(500)
        .json({ message: "Error adding data", error: err.message });
    } else {
      res.status(200).json({ message: "Added" });
    }
  });
});

//editing data
app.patch("/api/edit/:id", auth, (req, res) => {
  const userID = req.id;
  const detailsID = req.params.id;
  const updatedFields = req.body;

  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ message: "No columns to update provided" });
  }

  // Construct the SQL query with dynamic column names
  const updateQuery = "UPDATE details SET ? WHERE ID = ? AND UserID = ?";
  const values = [updatedFields, detailsID, userID];

  db.query(updateQuery, values, (err, results) => {
    if (err) {
      console.error("Error updating record:", err);
      return res
        .status(500)
        .json({ message: "Error updating record", error: err.message });
    } else {
      if (results.affectedRows === 0) {
        // No rows were updated (record not found or no changes)
        return res
          .status(404)
          .json({ message: "Record not found or no changes made" });
      } else {
        res.status(200).json({ message: "Updated" });
      }
    }
  });
});

//delete
app.delete("/api/delete/:id", auth, (req, res) => {
  const userID = req.id;
  const detailsID = req.params.id;
  const deleteQuery = "DELETE FROM details WHERE ID = ? AND UserID = ?";

  db.query(deleteQuery, [detailsID, userID], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: "Detail deleted successfully" });
    }
  });
});

//logout
app.post("/logout", auth, (req, res) => {
  db.end();
  res.json({ message: "Logged out" });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
