const config = {
  collectCoverage: true,
  coverageDirectory: './reports/tests/coverage',
  coverageReporters: [
    'cobertura',
    'json',
    'lcov',
    'text',
    'text-summary',
  ],
  modulePathIgnorePatterns: [
    'build/',
  ],
  preset: 'ts-jest',
  reporters: [
    'default',
    ['jest-junit',
      {
        outputDirectory: './reports/tests/unit',
        outputName: 'junit.xml',
      }],
    ['jest-html-reporters',
      {
        filename: 'index.html',
        publicPath: './reports/tests/unit',
      }],
  ],
  testEnvironment: 'node',
  verbose: true,
};

// ============================================================
// Exports
module.exports = config;
