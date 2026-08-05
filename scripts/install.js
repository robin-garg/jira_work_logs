#!/usr/bin/env node

/**
 * First-time installer for the Jira Worklog MCP server.
 *
 * Steps:
 *   1. Verify Node.js version (>= 18).
 *   2. Install npm dependencies.
 *   3. Compile TypeScript to dist/.
 *   4. Create .env from .env.example if missing.
 *   5. Print a ready-to-paste MCP client configuration block.
 *
 * Uses only Node.js stdlib so it can run before dependencies are installed.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const ENV_EXAMPLE = path.join(ROOT, '.env.example');
const MCP_ENTRY = path.join(ROOT, 'dist', 'interfaces', 'mcp', 'server.js');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(color, symbol, msg) {
  console.log(`${COLORS[color]}${symbol}${COLORS.reset} ${msg}`);
}

function step(msg) {
  console.log(`\n${COLORS.bold}${COLORS.cyan}» ${msg}${COLORS.reset}`);
}

function fail(msg) {
  log('red', '✗', msg);
  process.exit(1);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    fail(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

function checkNodeVersion() {
  step('Checking Node.js version');
  const major = parseInt(process.versions.node.split('.')[0], 10);

  if (Number.isNaN(major) || major < 18) {
    fail(`Node.js >= 18 is required. Current: ${process.versions.node}`);
  }

  log('green', '✓', `Node.js ${process.versions.node}`);
}

function installDependencies() {
  step('Installing npm dependencies');
  run('npm', ['install']);
  log('green', '✓', 'Dependencies installed');
}

function buildProject() {
  step('Compiling TypeScript');
  run('npm', ['run', 'build']);

  if (!fs.existsSync(MCP_ENTRY)) {
    fail(`Build completed but MCP entry not found: ${MCP_ENTRY}`);
  }

  log('green', '✓', 'Build output written to dist/');
}

function ensureEnvFile() {
  step('Configuring environment file');

  if (fs.existsSync(ENV_FILE)) {
    log('yellow', '!', '.env already exists — leaving it untouched');
    return false;
  }

  if (!fs.existsSync(ENV_EXAMPLE)) {
    fail(`.env.example not found at ${ENV_EXAMPLE}`);
  }

  fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
  log('green', '✓', 'Created .env from .env.example');
  return true;
}

function printMcpConfig(envWasCreated) {
  step('MCP client configuration');

  const config = {
    mcpServers: {
      'jira-worklog': {
        command: 'node',
        args: [MCP_ENTRY],
      },
    },
  };

  console.log(
    '\nAdd this entry to your MCP client config ' +
    '(e.g. claude_desktop_config.json):\n',
  );
  console.log(JSON.stringify(config, null, 2));

  console.log(
    `\n${COLORS.bold}Next steps:${COLORS.reset}\n` +
    `  1. ${envWasCreated ? 'Edit' : 'Verify'} ${ENV_FILE} with your Jira credentials.\n` +
    `  2. Wire AI clients (recommended):\n` +
    `       npm run configure-clients\n` +
    `     Or configure manually — see docs/mcp-clients/.\n` +
    `  3. Restart / reload each MCP client.\n`,
  );
}

function main() {
  console.log(`${COLORS.bold}Jira Worklog MCP — installer${COLORS.reset}`);

  checkNodeVersion();
  installDependencies();
  buildProject();
  const envWasCreated = ensureEnvFile();
  printMcpConfig(envWasCreated);

  log('green', '✓', 'Setup complete');
}

main();
