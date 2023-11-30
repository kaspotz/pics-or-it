# Pics-or-It Project Setup Guide

This repository, structured as a Yarn workspace, contains three main parts: the app (frontend), the server (backend), and the contracts (blockchain). This guide will help you set up and run each part of the project from the root directory.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

## Cloning the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/kaspotz/pics-or-it.git
cd pics-or-it
```

## Installing Dependencies

Install dependencies for all workspaces from the root directory:

```bash
yarn install
```

## Running the App (Frontend)

To start the app in development mode:

```bash
yarn app:dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Running the Server (Backend)

To start the server:

```bash
yarn server:dev
```

## Running the Contracts (Blockchain)

- **Compile Contracts:**

  ```bash
  yarn contract:compile
  ```

- **Run Tests on Contracts:**

  ```bash
  yarn contract:test
  ```

## Linting and Formatting

- **Lint Code:**

  ```bash
  yarn lint
  ```

- **Format Code:**

  ```bash
  yarn format
  ```

## General Notes

- These commands should be run from the root directory of the project.
- For more specific details or troubleshooting, refer to the README files and documentation within each directory.
