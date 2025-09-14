#!/bin/bash
# Path: co-learn/apis/install-test-deps.sh
# Role: Install all necessary dependencies for testing
# Run this to ensure all testing packages are installed

echo "📦 Installing test dependencies..."

# Install TypeScript if not present
npm install --save-dev typescript@latest

# Install test frameworks
npm install --save-dev mocha@latest chai@latest

# Install types
npm install --save-dev @types/node@latest @types/mocha@latest @types/chai@latest

# Install ts-node for running TypeScript tests
npm install --save-dev ts-node@latest

# Install supertest for API testing (optional but useful)
npm install --save-dev supertest@latest @types/supertest@latest

# Install NYC for coverage (optional)
npm install --save-dev nyc@latest

echo "✅ All test dependencies installed!"
echo ""
echo "Run tests with:"
echo "  npm run test:simple  (to verify setup)"
echo "  npm run test:folders (for folder tests)"
echo "  npm run test:classrooms (for classroom tests)"
echo "  npm run test:db (for database tests)"