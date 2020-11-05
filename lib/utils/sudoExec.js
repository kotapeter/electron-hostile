const sudo = require('sudo-prompt');

module.exports = (args, options = {}) => {
  return new Promise((resolve, reject) => {
    sudo.exec(
      args,
      options,
      (error, stdout) => {
        if (error) {
          reject(new Error(`Encountered an error: ${error}`));
        } else {
          resolve(stdout);
        }
      }
    );
  });
};
