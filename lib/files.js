var fs    = require('fs');
var path  = require('path');

module.exports = {
  /**
  * Returns the base of the current working directory
  * process.cwd() returns the current working directory of the Node.js process
  * path.basename() removing any directory names from a path and returns the last portion of it
  */
  getCurrentWorkingDirectory: function() {
    return path.basename(process.cwd());
  },
  /**
  * Checks if a given path leads to an directory
  * fs.statSync returns an instance of fs.Stats which contains information to a file/directory
  */
  checkDirectoryExists: function(path) {
    try {
      return fs.statSync(path).isDirectory();
    } catch (err) {
      return false;
    }
  }
}
