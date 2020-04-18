const appRoot = require('app-root-path');
const rimraf = require('rimraf');
const tmpResultsFolder = `${appRoot}/floodTests/tmp`;
const logResultsFile = `${appRoot}/logs/app.log`;


module.exports = function fileCleanup() {
  rimraf.sync(tmpResultsFolder)
  rimraf.sync(logResultsFile);
}