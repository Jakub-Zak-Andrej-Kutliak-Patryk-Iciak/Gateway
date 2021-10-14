export default class ProviderEnum {
  GOOGLE = "google";
  FACEBOOK = "facebook";
  APPLE = "apple";
  PASSWORD = "password";

  static parseProvider = (providerId) => {
    const provider = new ProviderEnum()
    const parsedProvider = Object.keys(provider)
      .map(key => provider[key])
      .filter(provider => providerId.indexOf(provider) !== -1)
      .map(provider => provider)

    if (parsedProvider.length > 1) {
      throw Error(`Provider does not exist. Provider id ${providerId} is invalid.`)
    }
    if (parsedProvider.length === 0) {
      console.log(`found provider=${new ProviderEnum().PASSWORD}`);
      parsedProvider.push(new ProviderEnum().PASSWORD)
    }
    console.log(`found provider=${parsedProvider[0]}`);
    return parsedProvider[0]
  }
}