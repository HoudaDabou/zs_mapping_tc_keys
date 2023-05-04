# zs_mapping_tc_keys
Node script based on Zephyr Scale Server REST API:https://support.smartbear.com/zephyr-scale-server/api-docs/v1

## Requirements
NodeJs 14.x

## How to use

### Install node dependencies with:

```
npm install
```

### Get duplicate test case names from a given Zephyr Scale project in Jira source.
Run the script with:

```
AUTH=username:password BASE_URL=<source_jira_url> PROJECT_KEY=<your_project_key> node ./get_duplicate_tc/zs_get_tc_source.js
```
The script returns this json output: ```/get_duplicate_tc/output/duplicate_test_cases.json```

### Get duplicate test case names from a given Zephyr Scale project in Jira source, run the script with:

```
AUTH=username:password SOURCE_BASE_URL=<source_jira_url> TARGET_BASE_URL=<target_jira_url> SOURCE_PROJECT_KEY=<source_project_key> TARGET_PROJECT_KEY=<target_project_key> node ./mapping_test_cases.js
```

This script returns 3 different json outputs:
```
./output/source_test_cases.json
./output/target_test_cases.json
./output/mapping_test_cases.json
```
