import amqplib from 'amqplib'


export class MQService {

  constructor({ amqpUrl, publishQueue, consumeQueue, onProcessMessage, autoConnect }) {
    if (!publishQueue && !consumeQueue) throw new Error("Consume or publish queue needs to be specified!")

    this.amqpUrl = amqpUrl;
    this.publishQueue = publishQueue
    this.consumeQueue = consumeQueue
    this.onProcessMessage = onProcessMessage
    this.clientTag = null // TODO: data about the browser?

    if (!consumeQueue) {
      this.consumeQueue = this.publishQueue
    } else if (!publishQueue) {
      this.publishQueue = this.consumeQueue
    }

    if (autoConnect) {
      this.connect()
        .catch(error => {
          console.error("Failed to connect to rabbitmq =>", error)
        })
    }
  }

  connect = async () => {
    if (this.connection) return
    this.connection = await amqplib.connect(this.amqpUrl, "heartbeat=60");
    this.channel = await this.connection.createChannel();

    process.once('SIGINT', async () => {
      console.log('got sigint, closing connection');
      await this.disconnect()
      process.exit(0);
    })
  }

  disconnect = async () => {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  consume = async () => {
    // TODO: no need for now, leaving here in case for later use
    await this.connect()
    // this.channel.prefetch(10);
    await this.channel.assertQueue(this.consumeQueue, { durable: false, autoDelete: true, exclusive: true });
    await this.channel.consume(this.consumeQueue, async (msg) => {
        await this.processMessage(msg);
        await this.channel.ack(msg);
      },
      {
        noAck: false,
        consumerTag: this.clientTag
      });
    console.log(`Message queue with id=${ this.consumeQueue } is ready to consume!`);
  }

  publish = async (message, shouldDisconnect = false) => {
    await this.connect()
    try {
      console.log('Sending request for data');
      await this.channel.publish('', process.env.MQ_MAIL_QUEUE, Buffer.from(JSON.stringify(message)));
      console.log('Message published');
    } catch (e) {
      console.error('Error in publishing message => ', e);
    } finally {
      if (shouldDisconnect) {
        await this.disconnect()
      }
    }
  }

  processMessage = async (message) => {
    console.log('---------------------------------');
    try {
      const data = JSON.parse(message.content.toString());
      console.log('received message from parking service: ', data)
      if (this.onProcessMessage) {
        this.onProcessMessage(data)
      }
    } catch (error) {
      console.error('Could not parse message to json:\n' + error + '\nin: ' + message.content.toString());
    }
  }

  setOnProcessMessage = (onProcessMessage) => {
    this.onProcessMessage = onProcessMessage
  }
}
