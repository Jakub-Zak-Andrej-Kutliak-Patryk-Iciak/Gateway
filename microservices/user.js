import express from 'express';

const port = 3000
let app = express();

app.get('/account', (req, res, next) => {
  res.send({ firstName: 'Jakub', lastName: 'Zak' })
})

app.get('/users', (req, res, next) => {
  res.send(["Tony","Lisa","Michael","Ginger","Food"])
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})