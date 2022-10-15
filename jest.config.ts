/* eslint-disable */
export default {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: "./test/coverage",
	coverageProvider: "v8",
	moduleNameMapper: {
		"@/(.*)": "<rootDir>/src/$1",
		"@test/(.*)": "<rootDir>/test/$1"
	},
	transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    }
}