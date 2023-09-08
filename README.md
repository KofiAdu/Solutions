# Solutions

# Solution One

This Node.js application uses the Express.js framework. 
It employs the express.json() middleware for JSON data parsing and serves user data obtained by merging two JSON databases, db1 and db2.
The /users endpoint responds to GET requests by combining data from these databases and returning the result as JSON.

# Solution Two
**Express API for User Authentication and Data Management**

This Node.js application utilizes the Express.js framework to create a secure API for user authentication and data management. 
It includes endpoints for user registration and login, using JWT (JSON Web Tokens) for authentication. 
Authenticated users can access and manage their personal data, such as favorite details (country, team, player, coach), through CRUD (Create, Read, Update, Delete) operations. 
The API enforces authentication using a middleware and securely hashes user passwords. 
It uses MySQL database for data storage. Additionally, there's a logout endpoint to end a user's session.

Note: The jwt secret key and the db login details are supposed to be in a .env file. This is just aa soltuion for the challenge.
