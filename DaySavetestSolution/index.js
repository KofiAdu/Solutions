const express = require('express');
const fs = require('fs');
const app = express();

const PORT = 5000;

app.use(express.json());

//json db1
const db1 = [
  {
    id: 1,
    name: 'Adu',
    email: 'adu@email.com',
    job: 'Software developer'
  },
  {
    id: 2,
    name: 'Agyekum',
    email: 'agyekum@email.com',
    job: 'teacher'
  }
];

//get user data
app.get('/users', (req, res) => {

  //read db2 from db2.json
  const db2 = JSON.parse(fs.readFileSync('db2.json'));

  const userData = [...db1, ...db2]; 
  res.status(200).json(userData);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
