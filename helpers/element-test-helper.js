const exec = require('child-process-promise').exec
const winston = require('./winston');

// enabled browser depending on environment
const showBrowser = process.env.NODE_ENV == "Production" ? "" : "--no-headless";
winston.info(`Running browser setting: ${showBrowser}`);

const maximumRetries = process.env.MAX_RETRIES === undefined ? "1" : process.env.MAX_RETRIES;
winston.info(`Maximum retries set to: ${maximumRetries}`);

// define test function to run a singular flood element test
const runTest = testScript => new Promise((resolve, reject) => {
  exec(`element run ${testScript} ${showBrowser} --no-sandbox`)
    .then(function (result) {
      var resultContent = result.stdout;
      if (!resultContent.toLowerCase().includes("error")) {
        winston.info("--- Test run completed successfully ---");
        winston.info(resultContent)
        resolve();
      } else {
        winston.error(resultContent)
        winston.error("--- Test run failed ---");
        reject();
      }
    }).catch(function (err) {
      reject(err);
    })
});

const delay = millis => new Promise((resolve, reject) => {
  setTimeout(_ => resolve(), millis)
});

//function for printing test results
function logResults(results) {
  winston.info("--- Results ---");
  for (const result of results) {
    var timesFailed = result.successful ? result.numTimesRan - 1 : result.numTimesRan;
    winston.info(`Test: ${result.testName} -> ${result.successful ? "successful!": "failed!"} -> failed: ${timesFailed} times`)
  }
}

async function runFloodTests(floodTests) {
  var testResults = [];
  for (const test of floodTests) {
    var testSuccessful = false;

    //get around transient failures by rerunning failed tests
    var numTimesRan = 0;

    while (numTimesRan < maximumRetries && testSuccessful === false) {
      winston.info(`--- Running test: ${test} ---`);

      try {
        await runTest(test);
        testSuccessful = true;
        winston.info(`--- Test successful: ${test} ---`);
      } catch (err) {
        winston.error(`--- Test failed: ${test} ---`);
        winston.error(err);
        testSuccessful = false;
      } finally {
        numTimesRan++;
      }
    }

    //store test result
    testResults.push({
      testName: test,
      successful: testSuccessful,
      numTimesRan: numTimesRan
    });
  }

  return testResults;
}

module.exports = {
  delay: delay,
  logResults: logResults,
  runFloodTests: runFloodTests
}