import admin from 'firebase-admin';
const { firestore: db } = admin;
import jwt from 'jsonwebtoken';
import { ProviderEnum } from "../enums/index.js";

export default class User {
  createdAt = db.FieldValue.serverTimestamp();
  updatedAt = db.FieldValue.serverTimestamp();
  version = 0;

  uid;
  firstName;
  lastName;
  email;
  photoUrl = null;
  provider = ProviderEnum.parseProvider("password");
  birthday = null;
  gender = null;

  constructor({ uid, firstName, lastName, email, photoUrl, provider, birthday, gender } = {}) {
    this.uid = uid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.photoUrl = photoUrl ?? null;
    this.provider = provider ?? ProviderEnum.parseProvider("password");;
    this.birthday = birthday ?? null;
    this.gender = gender ?? null;
  }

  getUserProps = () => {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
      uid: this.uid,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      photoUrl: this.photoUrl,
      provider: this.provider,
      birthday: this.birthday,
      gender: this.gender,
    }
  }
  isValid = () => !!this.uid && !!this.firstName && !!this.lastName && !!this.email && !!this.provider
  isProfileComplete = () => this.isValid() && !!this.birthday && !!this.gender

  getThisUserByUid = async () => {
    return User.getUserByUid(this.uid)
  }

  generateToken = (secret) => {
    const payload = {
      uid: this.uid,
      firstName: this.firstName,
      lastName: this.lastName,
      photoUrl: this.photoUrl,
      version: this.version,
      isProfileComplete: this.isProfileComplete(),
    }
    return jwt.sign(payload, secret, { algorithm: 'RS256', expiresIn: 60 * 60 })
  }

  createThisUser = async () => {
    if (!this.isValid()) throw Error("Failed to create new user, data is not valid.")
    return User.createUser({
      uid: this.uid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      photoUrl: this.photoUrl,
      provider: this.provider,
      birthday: this.birthday,
      gender: this.gender,
    });
  }

  updateThisUser = async () => {
    await User.updateUser(this)
    return this;
  }

  static getCollection = () => {
    return db().collection('users')
  }
  static getUserByUid = async (uid) => {
    return this.getCollection().doc(uid).get().then(doc => {
      if (!doc.data()) return new User()
      return new User({
        uid,
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt,
        version: doc.data().version,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        email: doc.data().email,
        photoUrl: doc.data().photoUrl,
        provider: doc.data().provider,
        birthday: doc.data().birthday,
        gender: doc.data().gender,
      })
    }).catch(error => { throw Error(`User does not exist ${error}`)})
  }
  static createUser = async (data) => {
    const newUser = new User(data)
    const { uid, ...rest } = newUser.getUserProps()
    await this.getCollection().doc(uid).set(rest)
    return newUser
  }
  static updateUser = async (user) => {
    const { uid, version, ...other } = user.getUserProps()
    return this.getCollection().doc(uid).update({
      version: version + 1,
      updatedAt: db.FieldValue.serverTimestamp(),
      ...other,
    });
  }
}