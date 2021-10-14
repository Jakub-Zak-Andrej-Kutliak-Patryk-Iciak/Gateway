export default class TokenResponse {
  token

  constructor(token) {
    this.token = token
  }

  setToken = (token) => {
    this.token = token
  }

  getToken = () => {
    return this.token
  }

  format = () => {
    return { token: this.token }
  }
}