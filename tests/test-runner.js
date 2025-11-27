// A simple, dependency-free test runner
const fs = require('fs');
const path = require('path');

const tests = [];
let currentSuite = '';

const describe = (name, fn) => {
  currentSuite = name;
  console.log(`\nRunning suite: ${name}`);
  fn();
};

const it = (name, fn) => {
  tests.push({ name: `  ${name}`, fn });
};

const assertEquals = (actual, expected, message = 'assertEquals failed') => {
  // Simple deep comparison for objects
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
};

const assertTrue = (actual, message = 'assertTrue failed') => {
  if (!actual) {
    throw new Error(`${message}: Expected true but got false`);
  }
};

const runTests = async () => {
  const testsDir = __dirname;
  fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.test.js'))
    .forEach(file => {
      // We need to load the modules under test relative to the project root, not the tests directory.
      // This is a bit tricky without a proper module loader.
      // For now, we assume the test files will handle their own imports.
      require(path.join(testsDir, file));
    });

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✓ ${test.name}`);
      passed++;
    } catch (e) {
      console.error(`✗ ${test.name}`);
      // Indent error message for better readability
      const errorMessage = e.stack.split('\n').map(line => `  ${line}`).join('\n');
      console.error(errorMessage);
      failed++;
    }
  }

  console.log('\n--------------------');
  console.log('Test Summary:');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);
  console.log('--------------------');

  if (failed > 0) {
    process.exit(1);
  }
};

// Expose globals for test files
global.describe = describe;
global.it = it;
global.assertEquals = assertEquals;
global.assertTrue = assertTrue;

runTests();