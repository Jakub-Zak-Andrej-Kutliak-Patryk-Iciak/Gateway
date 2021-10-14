import express from 'express';

const port = 3001
let app = express();

app.get('/musics', (req,res,next) => {
  res.status(200).send(['Jesus', 'I love to praise your name', 'My Story', 'Days of Elijah'])
})

app.listen(port, () => {
  console.log(`Music server running on port ${port}`)
})