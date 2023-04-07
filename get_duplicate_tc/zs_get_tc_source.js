#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const auth = process.env.AUTH;
const authToken = Buffer.from(auth).toString('base64');
const baseUrl = process.env.BASE_URL;
const search = `projectKey = "${process.env.PROJECT_KEY}"`;
const query = `query=${encodeURIComponent(search)}&fields=name,key&maxResults=5000`;

const options = {
  hostname: `${baseUrl}`,
  path: `/rest/atm/1.0/testcase/search?${query}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authToken}`,
  }
};

const getTestCases = () => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const testCases = JSON.parse(data);
        resolve(testCases);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
};
  
const writeDuplicateTestCases = (duplicateTestCases) => {
  fs.writeFile('./get_duplicate_tc/output/duplicate_source_test_cases.json', JSON.stringify(duplicateTestCases, null, 2), err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Duplicate test cases saved to ./get_duplicate_tc/output/duplicate_test_cases.json');
  });
};
  
const checkDuplicateTestCases = async () => {
  const testCases = await getTestCases();
  const testCaseNames = testCases.map(testCase => testCase.name);
  const uniqueTestCaseNames = [...new Set(testCaseNames)];
  const duplicateTestCaseNames = uniqueTestCaseNames.filter((testCaseName) => {
    const occurrences = testCaseNames.filter((name) => name === testCaseName);
    return occurrences.length > 1;
  });
  const duplicateTestCases = testCases.filter((testCase) => {
    return duplicateTestCaseNames.includes(testCase.name);
  });
  writeDuplicateTestCases(duplicateTestCases);
};

const writeTestCases = (testCases) => {
  fs.writeFile('./get_duplicate_tc/output/all_source_test_cases.json', JSON.stringify(testCases, null, 2), err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Test cases saved to ./get_duplicate_tc/output/all_source_test_cases.json');
  });
};

const main = async () => {
  const testCases = await getTestCases();
  writeTestCases(testCases);
  await checkDuplicateTestCases();
};

main().catch((error) => {
  console.error(error);
});