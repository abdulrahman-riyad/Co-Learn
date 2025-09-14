// Path: co-learn/apis/test-runner.js
// Role: Alternative test runner that avoids TypeScript issues
// Run with: node test-runner.js

// Register TypeScript support
require('ts-node/register');

// Set up environment
process.env.NODE_ENV = 'test';

// Import and run tests
console.log('🧪 Running Co-Learn Tests...\n');

try {
  // Run simple test
  console.log('Testing basic setup...');
  require('./tests/simple-test.spec.ts');
  
  // Run database tests
  console.log('\nTesting database connection...');
  require('./tests/database/database.spec.ts');
  
  // Run folder tests
  console.log('\nTesting folder APIs...');
  require('./tests/folders/folders.spec.ts');
  
  // Run classroom tests
  console.log('\nTesting classroom APIs...');
  require('./tests/classrooms/classrooms.spec.ts');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests completed!');

// Alternative: Use Mocha programmatically
// Uncomment below if above doesn't work:
/*
const Mocha = require('mocha');
const mocha = new Mocha({
  timeout: 20000,
  reporter: 'spec'
});

// Add test files
mocha.addFile('./tests/simple-test.spec.ts');
mocha.addFile('./tests/database/database.spec.ts');
mocha.addFile('./tests/folders/folders.spec.ts');
mocha.addFile('./tests/classrooms/classrooms.spec.ts');

// Run tests
mocha.run(failures => {
  process.exitCode = failures ? 1 : 0;
});
*/