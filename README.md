# Auto Web Reviewer

An automated quality assurance tool for web projects. This application performs comprehensive checks on different types of web projects using Puppeteer for headless browser testing.

test commit

## Overview

Auto Web Reviewer is a Next.js web application designed to automate quality assurance checks on different types of web projects. It uses Puppeteer to run headless browser tests against specified websites, providing detailed reports on compliance with various quality standards and best practices.

## Key Features

1. **Multi-Project Type Support**

   - **SJ (Student Journey)**: Validates specific requirements for student journey websites
   - **PS (Paid Search)**: Tests paid search landing pages and forms
   - **DIQ (Demonstrated Interest Questionnaire)**: Verifies DIQ pages with term-specific requirements

2. **Comprehensive QA Checks**

   - Accessibility checks (skip-to-content links)
   - Form attribute validation
   - Proper form ID implementation
   - Search engine indexing configuration
   - Performance optimization (lazy loading for videos)
   - URL structure verification
   - Hidden field validation
   - Link target attribute verification
   - Page speed insights integration

3. **Real-time Feedback**: Outputs test results in real-time as each check is completed

## Technical Architecture

### Frontend (Next.js)

The application features a user-friendly form interface where users can:

- Input an Acquia URL to test
- Select a project type (SJ, PS, DIQ)
- Provide additional parameters for DIQ projects (year and term)
- Submit the form to initiate the automated review

### Backend (API Routes)

- `/api/review/route.ts`: Main endpoint that processes review requests

### Puppeteer Test Engine

The core testing logic is organized into modular components:

1. **Runners**:

   - `puppeteer-checklist.js`: Main orchestrator that selects and executes the appropriate checklist
   - Project-specific checklists: `sj-checklist.js`, `ps-checklist.js`, `diq-checklist.js`

2. **Check Modules**:
   - Shared checks (`/checks/shared/`): Common tests used across project types
   - Project-specific checks: Specialized tests for each project type

## Workflow

1. User enters a URL and selects project type in the UI
2. The application sends this data to the API endpoint
3. The API initializes the appropriate checklist with environment variables
4. Puppeteer opens a headless browser and runs the selected checklist
5. Each checklist navigates to relevant pages and runs specific tests
6. Test results are displayed in real-time in the console/UI
7. A comprehensive report is provided after all checks are complete

## Getting Started

Install and then run the development server:


```bash
yarn install

npm run dev
# or
yarn dev
