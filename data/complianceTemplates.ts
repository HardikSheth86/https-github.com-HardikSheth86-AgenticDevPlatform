import { CodeFile } from '../types';

export const COMPLIANCE_FILES: CodeFile[] = [
  {
    path: 'bmad.config.json',
    language: 'json',
    content: `{
  "project": "copilot-agent-workspace",
  "framework": "BMAD (Behavioral Multi-Agent Developer) v2.1",
  "compliance": {
    "securityLevel": "strict",
    "requireCodeQL": true,
    "minTestCoverage": 90
  },
  "agents": {
    "orchestrator": "gemini-2.5-flash",
    "developer": "copilot-core",
    "reviewer": "copilot-security"
  }
}`
  },
  {
    path: '.github/workflows/bmad-ci.yml',
    language: 'yaml',
    content: `name: BMAD Compliance CI

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main" ]

jobs:
  compliance-check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
    - name: Install Dependencies
      run: npm ci
    - name: Run Tests with Coverage
      run: npm test -- --coverage --coverageThreshold='{"global":{"lines":90}}'
    - name: Run CodeQL Analysis
      uses: github/codeql-action/analyze@v2`
  },
  {
    path: 'SECURITY.md',
    language: 'markdown',
    content: `# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities to the Copilot Security Agent via the "Review" tab in BMAD Studio.`
  },
  {
    path: 'README.md',
    language: 'markdown',
    content: `# Generated Project

This project was bootstrapped by **BMAD Studio** using GitHub Copilot Agents.

## Architecture
- **Orchestrator**: Manages workflow state.
- **Copilot Core**: Handles implementation and unit testing.
- **GitHub Actions**: Manages CI/CD pipelines.

## Scripts
- \`npm run start\`: Start dev server
- \`npm run test\`: Run test suite (requires 90% coverage)`
  }
];