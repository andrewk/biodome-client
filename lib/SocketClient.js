import ws from 'ws';
import EventEmitter from 'eventemitter3';

export default class SocketClient {
  constructor({ host, isSSL, eventBus }) {
    this.events = eventBus || new EventEmitter();
    const protocol = (isSSL) ? 'wss://' : 'ws://';

    // FIXME: needs reconnection strategy
    this.connection = new ws(protocol + host);
    this.connection.on('open', () => this.events.emit('open', this));
    this.connection.on('close', () => this.events.emit('close', this));
    this.connection.on('message', this.emitMessage.bind(this));
    this.connection.on('error', this.socketError.bind(this));
  }

  on(event, listener) {
    return this.events.on(event, listener)
  }

  emitMessage(rawMessage) {
    let msg = null;
    try {
      msg = JSON.parse(rawMessage);
    } catch(error) {
      return this.socketError('Server returned invalid response');
    }

    if (msg.type === 'error') {
      this.events.emit('error', msg.data);
    } else if (msg.type === 'data') {
      this.events.emit('data', msg.data);
    }
  }

  socketError(error) {
    this.events.emit('server_error', error);
  }

  close() {
    this.connection.close();
  }
}
