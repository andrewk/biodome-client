import TokenClient from 'lib/TokenClient';
import SocketClient from 'lib/SocketClient';
import CommandDispatcher from 'lib/CommandDispatcher';

export default class Client {
  constructor({ host, isSecureConnection, eventBus }) {
    this.conf = { host, isSecureConnection, eventBus };
    this.tokenClientInstance = null;
    this.socketClientInstance = null;
  }

  commands() {
    return most.fromEvent('commands', this.conf.eventBus);
  }

  errors() {
    return most.fromEvent('error', this.conf.eventBus);
  }

  data() {
    return most.fromEvent('data', this.conf.eventBus);
  }

  id(id) {
    return this.data()
      .filter((d) => d.id === id);
  };

  type(type) {
    return this.data()
      .filter((d) => d.type === type);
  };

  tokenClient() {
    if (!this.tokenClientInstance) {
      this.tokenClientInstance = new TokenClient(this.conf)
    }

   return this.tokenClientInstance;
  }

  socketClient() {
    if (!this.socketClientInstance) {
      this.socketClientInstance = new SocketClient(this.conf);
    }

   return this.socketClientInstance;
  }

  commandDispatcher() {
    if (!this.commandDispatcherInstance) {
      const emitter = (cmd) => {
        this.connection.send({
          type: 'command',
          data: cmd
        });
      };

      this.commandDispatcher = new CommandDispatcher(emitter);
    }
    return this.commandDispatcherInstance;
  }
}
