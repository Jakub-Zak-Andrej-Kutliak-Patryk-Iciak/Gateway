export default class MessageResponse {
  message

  constructor(message) {
    this.message = message
  }

  setMessage = (message) => {
    this.message = message
  }

  getMessage = () => {
    return this.message
  }

  format = () => {
    return { message: this.message }
  }
}