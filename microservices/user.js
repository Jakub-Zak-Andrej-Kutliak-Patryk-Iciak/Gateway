import express from 'express';
import env from '../envConfig.js';

let app = express();

app.get('/register/complete', (req, res, next) => {
  //TODO: update user
  res.json({ message: 'Account completed' })
})

app.listen(env.PARKING_PORT, () => {
  console.log(`Server running on port ${env.PARKING_PORT}`);
})