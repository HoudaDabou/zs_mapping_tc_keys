#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const auth = process.env.AUTH;
const authToken = Buffer.from(auth).toString('base64');

// GET all test cases from a given Zephyr Scale project in Jira source
const source_baseUrl = process.env.SOURCE_BASE_URL;
const searchSourceProject = `projectKey = "${process.env.SOURCE_PROJECT_KEY}"`;
const querySource = `query=${encodeURIComponent(searchSourceProject)}&fields=name,key,testScript&maxResults=5000`;

const optionsSource = {
  hostname: `${source_baseUrl}`,
  path: `/rest/atm/1.0/testcase/search?${querySource}`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${authToken}`,
  }
};

let sourceTestCases = [];

const reqJiraSrouce = https.request(optionsSource, res => {
  console.log(`Request from Jira source - statusCode: ${res.statusCode}`);

  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    sourceTestCases = JSON.parse(data);
    fs.writeFile('./output/source_test_cases.json', JSON.stringify(sourceTestCases, null, 2), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Source Test cases saved to ./output/source_test_cases.json');
    });
    getTargetTestCases();
  });
});

reqJiraSrouce.on('error', error => {
  console.error(error);
});

reqJiraSrouce.end();


// GET all test cases from a given Zephyr Scale project in Jira target
function getTargetTestCases() {
  const searchTarget = `projectKey = "${process.env.TARGET_PROJECT_KEY}"`;
  const queryTarget = `query=${encodeURIComponent(searchTarget)}&fields=name,key&maxResults=5000`;
  const target_baseUrl = process.env.TARGET_BASE_URL;

  const optionsTarget = {
    hostname: `${target_baseUrl}`,
    path: `/rest/atm/1.0/testcase/search?${queryTarget}`,
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authToken}`,
    }
  };

  let targetTestCases = [];

  const reqJiraTarget = https.request(optionsTarget, res => {
    console.log(`Request from Jira target - statusCode: ${res.statusCode}`);

    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      targetTestCases = JSON.parse(data);
      fs.writeFile('./output/target_test_cases.json', JSON.stringify(targetTestCases, null, 2), err => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Target Test cases saved to ./output/target_test_cases.json');
        createTestCaseMap(sourceTestCases, targetTestCases);
      });
    });
  });

  reqJiraTarget.on('error', error => {
    console.error(error);
  });

  reqJiraTarget.end();
}

// Mapping Old Test Case Keys, New Test Case Keys and Test Case Names
function createTestCaseMap(sourceTestCases, targetTestCases) {
    let testCaseMapping = [];
  
    for (let i = 0; i < sourceTestCases.length; i++) {
      const sourceTestCase = sourceTestCases[i];
  
      for (let j = 0; j < targetTestCases.length; j++) {
        if (sourceTestCase.name === targetTestCases[j].name) {
          testCaseMapping.push({
            name: targetTestCases[j].name,
            oldkey: sourceTestCase.key,
            newkey: targetTestCases[j].key
          });
        }
      }
    }
  
    fs.writeFile('./output/mapping_test_cases.json', JSON.stringify(testCaseMapping, null, 2), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Test cases mapping saved to ./output/mapping_test_cases.json');
    });
  }
  
