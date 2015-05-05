export default class CommandDispatcher {
  constructor(emitter) {
    this.emitter = emitter;
  }

  on(id) {
    this.dispatch({id, value: 1});
  }

  off(id) {
    this.dispatch({id, value: 0});
  }

  dispatch(cmd) {
    const mode = cmd.value === undefined ? 'read' : 'write';
    const selector = cmd.id ? {id: cmd.id} : {type: cmd.type};
    this.emitter({
      selector,
      instruction: {type: mode, value: cmd.value}
    });
  }
}
