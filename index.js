const winston = require('./helpers/winston');
const fileCleanup = require("./helpers/file-helper");
const testHelpers = require("./helpers/element-test-helper");

//remove all old results and logs
winston.info(`--- Cleaning up all old files ---`);
fileCleanup();

// register tests to run
const floodTests = [
  "./floodTests/test.ts",
];

winston.info("--- Starting Flood Element tests ---");

// run tests
testHelpers.runFloodTests(floodTests)
  //log results
  .then(testResults => {
    testHelpers.logResults(testResults);
    return testResults;
  })
  .then(async testResults => {
    await testHelpers.delay(1000);
    const testsPassedSuccessfully = testResults.every(test => test.successful === true)
    testsPassedSuccessfully ? winston.info(`All tests passed successfully!`) : winston.info(`One/All tests passed failed!`);
    winston.info("--- Completed Flood Element tests ---");
    testsPassedSuccessfully ? process.exit(0) : process.exit(1);
  });