module.exports = function(conf) {
  return {
    'command' : conf.host + '/command',
    'token' : conf.host + '/token'
  };
};
