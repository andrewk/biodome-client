import ws from 'ws';
import TokenClient from './lib/TokenClient';

export default class Client {
  constructor({ host, isSecureConnection, events }) {
    this.conf = { host, isSecureConnection };
    this.events = events;
    this.connect();
  }

  connect() {
    // TODO integrate token client
    // TODO reconnection strategy

    const protocol = this.conf.isSecureConnection ? 'wss://' : 'ws://';
    this.connection = new ws(protocol + this.conf.host);
    this.connection.on('open', () => this.events.emit('connection.open', this));
    this.connection.on('close', () => this.events.emit('connection.close', this));
    this.connection.on('error', () => this.events.emit('connection.error', this));
    this.connection.on('message', (message) => {
      let msg = null;
        try {
          msg = JSON.parse(message);
        } catch(error) {
          // FIXME: do something with this error
        }

      // TODO: validate message data first
      this.events.emit(msg.type, msg.data);
    });
  }

  close() {
    if (this.connection) {
      this.connection.close();
    }
  }

  commands() {
    return most.fromEvent('commands', this.conf.events);
  }

  data() {
    return most.fromEvent('data', this.conf.events);
  }

  id(id) {
    return this.data()
      .filter((d) => d.id === id);
  }

  type(type) {
    return this.data()
      .filter((d) => d.type === type);
  }

  on(id) {
    this.issueCommand({id, value: 1});
  }

  off(id) {
    this.issueCommand({id, value: 0});
  }

  issueCommand(cmd) {
    const mode = cmd.value === undefined ? 'read' : 'write';
    const selector = cmd.id ? {id: cmd.id} : {type: cmd.type};

    this.connection.send(JSON.stringify({
      type: 'command',
      data: {
        selector,
        instruction: {type: mode, value: cmd.value}
      }
    }));
  }
}
