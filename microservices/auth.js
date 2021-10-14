import express from 'express';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import admin from 'firebase-admin';
import cors from 'cors';
import bodyParser from "body-parser";

import { User } from './models/index.js';
import { ProviderEnum } from "./enums/index.js";
import { readFileSync } from "fs";
import { TokenResponse, ErrorResponse, MessageResponse } from "./models/response/index.js";

const port = 3002 //process.env.AUTH_PORT;

const serviceAccount = JSON.parse(
  readFileSync('/Users/jakubzzak/Developer/parking-app-62183-firebase-adminsdk-c6xca-fcfeb1f1aa.json')
)
const tokenPrivateKey = readFileSync('jwtRS256.key')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://parking-app-62183-default-rtdb.europe-west1.firebasedatabase.app"
});

initializeApp({
  apiKey: "AIzaSyAdSFDbZFKdc0IGe09sBW6YcwDrZFUxF6E",
  authDomain: "parking-app-62183.firebaseapp.com",
  projectId: "parking-app-62183",
  storageBucket: "parking-app-62183.appspot.com",
  messagingSenderId: "740163352862",
  appId: "1:740163352862:web:c0ff54dffc7f7d4f1eb10f",
  measurementId: "G-L4Y697GZW4"
})

const app = express();
const auth = express();
app.use(cors())
app.use(bodyParser.json())
app.use((req, res, next) => {
  console.log(`Incoming request to auth service from url=${req.hostname}${req.path}`)
  next()
})
app.use('/auth', auth)

auth.post('/register', (req, res) => {
  console.log("Handling register")
  const { email, password, firstName, lastName } = req.body
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json(new ErrorResponse('Missing required fields.').format())
  } else {
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        if (userCredentials) {
          const user = userCredentials.user
          User.createUser({
            uid: user.uid,
            email,
            firstName,
            lastName
          }).then(user => {
            res.json(new TokenResponse(user.generateToken(tokenPrivateKey)).format());
          }).catch(error => new ErrorResponse(error).format())
        } else {
          res.status(500).json(new ErrorResponse("External error, user not created.").format())
        }
      }).catch(error => res.status(500).json(new ErrorResponse("User with this email already exists.", error).format()))
  }
})

auth.post('/login', (req, res) => {
  console.log("Handling login")
  if (req.body.providerId) {
    const { providerId, uid, firstName, lastName, email, photoUrl, accessToken } = req.body
    let provider
    try {
      provider = ProviderEnum.parseProvider(providerId)
    } catch (error) {
      return res.status(400).json(new ErrorResponse(error).format())
    }

    User.getUserByUid(uid).then(async user => {
      if (!user.isValid()) {
        await User.createUser({ uid, provider, firstName, lastName, email, photoUrl })
      }
      res.json(new TokenResponse(user.generateToken(tokenPrivateKey)).format());
    }).catch(error => res.status(500).json(new ErrorResponse(error).format()))
  } else {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(() => new ErrorResponse('Email or password is incorrect.').format())
    }
    const auth = getAuth()
    signInWithEmailAndPassword(auth, email, password)
      .then(user => {
        if (user) {
          const { uid, displayName, email } = auth.currentUser
          User.getUserByUid(uid)
            .then(user => res.json(new TokenResponse(user.generateToken(tokenPrivateKey))))
            .catch(error => res.status(500).json(new ErrorResponse(error).format()))
        } else {
          res.status(500).json(new ErrorResponse("Email or password is incorrect.").format())
        }
      }).catch(error => res.status(500).json(new ErrorResponse(error).format()))
  }
})

auth.post('/signOut', (req, res) => {
  console.log("Handling logout")
  const auth = getAuth();
  signOut(auth).then(() => {
    res.json(new MessageResponse("User signed out successfully.").format())
  }).catch((error) => res.status(500).json(new ErrorResponse(error).format()));
})

// TODO: verify google signature
// const {OAuth2Client} = require('google-auth-library');
// const client = new OAuth2Client(CLIENT_ID);
// async function verify() {
//   const ticket = await client.verifyIdToken({
//     idToken: token,
//     audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//     // Or, if multiple clients access the backend:
//     //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//   });
//   const payload = ticket.getPayload();
//   const userid = payload['sub'];
//   // If request specified a G Suite domain:
//   // const domain = payload['hd'];
// }
// verify().catch(console.error);


app.listen(port, () => {
  console.log(`Auth server running on port ${port}`);
})

