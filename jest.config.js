/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*-spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: false }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^../src/generated/prisma/client$":
      "<rootDir>/test/__mocks__/prisma-client.ts",
    "^../../src/generated/prisma/client$":
      "<rootDir>/test/__mocks__/prisma-client.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
