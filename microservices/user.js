import express from 'express';
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
// import admin from 'firebase-admin';
import cors from "cors";
import bodyParser from "body-parser";
import { ErrorResponse, MessageResponse } from "./models/response/index.js";
import { User } from "./models/index.js";
// import { readFileSync } from "fs";
import fetch from "node-fetch";

const app = express();
const user = express();
app.use(cors())
app.use(bodyParser.json())
app.use((req, res, next) => {
  console.log(`Incoming request to user service from url=${req.hostname}${req.path}`)
  next()
})
app.use((req, res, next) => {
  fetch('http://localhost:8080/auth/isTokenValid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({ token: req.headers.authorization })
  })
    .then(response => {
      console.log('token response', response.body)
      req.body.currentUser = response.body.user
      next()
    })
})
app.use('/user', user)

// const serviceAccount = JSON.parse(
//   readFileSync(`${process.env.FIREBASE_CONFIG_PATH}/parking-app-62183-firebase-adminsdk-c6xca-fcfeb1f1aa.json`)
// )
//
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://parking-app-62183-default-rtdb.europe-west1.firebasedatabase.app"
// });

const userApp = initializeApp({
  apiKey: "AIzaSyAdSFDbZFKdc0IGe09sBW6YcwDrZFUxF6E",
  authDomain: "parking-app-62183.firebaseapp.com",
  projectId: "parking-app-62183",
  storageBucket: "parking-app-62183.appspot.com",
  messagingSenderId: "740163352862",
  appId: "1:740163352862:web:c0ff54dffc7f7d4f1eb10f",
  measurementId: "G-L4Y697GZW4"
}, "UserService")

user.post('/account/complete', (req, res) => {
  console.log("Handling account complete")
  const { gender, birthday, user } = req.body
  if (!gender || !birthday) {
    return res.status(404).json(new ErrorResponse("Wrong request format.").format())
  }

  const auth = getAuth(userApp);
  console.log("Current user is:", user)
  if (auth.currentUser) {
    User.getUserByUid(auth.currentUser.uid)
      .then(user => {
        if (user) {
          user.gender = gender
          user.birthday = birthday
          user.updateThisUser()
            .then(() => {
              return res.json(new MessageResponse("User updated successfully.").format())
            }).catch(error => {
            return res.status(500).json(new ErrorResponse(error).format())
          })
        } else {
          return res.status(500).json(new ErrorResponse("User not found.").format())
        }
      }).catch(error => {
      return res.status(500).json(new ErrorResponse(error).format())
    })
  }
  res.status(401).json(new ErrorResponse("User needs to be signed in to complete their account.").format())
})

user.post('/confirm-booking', (req, res) => {
  console.log('about to confirm booking')
  // TODO: should consume messages from payment service
})

app.listen(process.env.USER_PORT, () => {
  console.log(`UserService running on port ${process.env.USER_PORT}`);
})