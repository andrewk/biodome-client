import ws from 'ws';

export default class SocketClient {
  constructor({ host, isSSL, eventBus }) {
    this.events = eventBus;
    const protocol = (isSSL) ? 'wss://' : 'ws://';

    // FIXME: needs reconnection strategy
    this.connection = new ws(protocol + host);
    this.connection.on('open', () => this.events.emit('connection.open', this));
    this.connection.on('close', () => this.events.emit('connection.close', this));
    this.connection.on('message', this.emitMessage.bind(this));
    this.connection.on('error', this.socketError.bind(this));
  }

  on(event, listener) {
    return this.events.on(event, listener)
  }

  send(data) {
    this.connection.send(data);
  }

  emitMessage(rawMessage) {
    let msg = null;
    try {
      msg = JSON.parse(rawMessage);
    } catch(error) {
      return this.socketError('Server returned invalid response');
    }

    this.events.emit(msg.type, msg.data);
  }

  socketError(error) {
    this.events.emit('connection.error', error);
  }

  close() {
    this.connection.close();
  }
}
