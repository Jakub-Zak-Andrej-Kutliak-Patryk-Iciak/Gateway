import express from 'express';

let app = express();

app.get('/register/complete', (req, res, next) => {
  //TODO: update user
  res.json({ message: 'Account completed' })
})

app.listen(process.env.PARKING_PORT, () => {
  console.log(`Server running on port ${process.env.PARKING_PORT}`);
})