/** @type {import('jest').Config} */
module.exports = {
    // Use jsdom to simulate a browser environment for React component tests
    testEnvironment: 'jest-environment-jsdom',

    // Babel transforms .js and .jsx files through the existing .babelrc
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },

    // Resolve both .js and .jsx extensions without explicit file extension imports
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

    // Map static asset imports so they don't crash the test runner
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
        '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/__mocks__/fileMock.cjs',
    },

    // Load jest-dom matchers (toBeInTheDocument, etc.) before every test suite
    setupFilesAfterEnv: ['@testing-library/jest-dom'],

    // Where Jest should discover tests
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],

    // Skip node_modules and the Vite build output
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],

    // Coverage collection scoped to application source files
    collectCoverageFrom: [
        'src/**/*.[jt]s?(x)',
        '!src/**/*.d.ts',
        '!src/main.jsx',
        '!src/i18n.js',
    ],

    coverageReporters: ['text', 'lcov', 'clover'],
};
