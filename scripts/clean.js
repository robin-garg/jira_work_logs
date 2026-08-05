#!/usr/bin/env node

/**
 * Remove build artifacts and dependencies so you can re-run a fresh setup.
 *
 * Default (safe): deletes node_modules/, dist/, and TypeScript build info.
 * Does not touch .env (credentials are preserved).
 *
 * Usage:
 *   npm run clean
 *   npm run clean -- --with-env     # also delete .env and recreate from .env.example
 *   npm run reset-env               # only reset .env from .env.example
 *   npm run setup:clean             # clean, then run npm run setup
 *   npm run setup:clean:env         # clean (incl. .env reset), then setup
 *
 * Uses only Node.js stdlib so it works even if node_modules is missing.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const ENV_EXAMPLE = path.join(ROOT, '.env.example');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
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

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  return {
    withEnv: flags.has('--with-env'),
    envOnly: flags.has('--env-only'),
    setup: flags.has('--setup'),
    help: flags.has('--help') || flags.has('-h'),
  };
}

function printHelp() {
  console.log(`
${COLORS.bold}Jira Worklog MCP — clean${COLORS.reset}

Removes install/build artifacts so you can start from a clean slate.

Usage:
  node scripts/clean.js [options]
  npm run clean
  npm run clean -- --with-env
  npm run reset-env
  npm run setup:clean
  npm run setup:clean:env

Options:
  --with-env   Delete .env and recreate it from .env.example
  --env-only   Only reset .env (do not remove node_modules/dist)
  --setup      After cleaning, run npm run setup
  -h, --help   Show this help
`);
}

function rmPath(target) {
  const absolute = path.isAbsolute(target) ? target : path.join(ROOT, target);

  if (!fs.existsSync(absolute)) {
    log('dim', '·', `Skip (not found): ${path.relative(ROOT, absolute) || '.'}`);
    return false;
  }

  fs.rmSync(absolute, { recursive: true, force: true });
  log('green', '✓', `Removed ${path.relative(ROOT, absolute) || '.'}`);
  return true;
}

function cleanBuildInfo() {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true });
  let removed = 0;

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.tsbuildinfo')) {
      rmPath(entry.name);
      removed += 1;
    }
  }

  return removed;
}

function resetEnvFile() {
  step('Resetting environment file');

  if (!fs.existsSync(ENV_EXAMPLE)) {
    fail(`.env.example not found at ${ENV_EXAMPLE}`);
  }

  if (fs.existsSync(ENV_FILE)) {
    fs.rmSync(ENV_FILE, { force: true });
    log('green', '✓', 'Removed .env');
  } else {
    log('dim', '·', 'Skip (not found): .env');
  }

  fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
  log('green', '✓', 'Created fresh .env from .env.example');
  log('yellow', '!', 'Edit .env with your Jira credentials before using the server');
}

function runSetup() {
  step('Running fresh setup');
  const result = spawnSync('npm', ['run', 'setup'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    fail('Setup failed after clean');
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    printHelp();
    return;
  }

  console.log(`${COLORS.bold}Jira Worklog MCP — clean${COLORS.reset}`);

  if (opts.envOnly) {
    resetEnvFile();
    log('green', '✓', '.env reset complete');
    return;
  }

  step('Removing install and build artifacts');
  rmPath('node_modules');
  rmPath('dist');
  rmPath('package-lock.json');
  cleanBuildInfo();

  if (opts.withEnv) {
    resetEnvFile();
  } else if (fs.existsSync(ENV_FILE)) {
    log(
      'yellow',
      '!',
      '.env kept (pass --with-env to delete and regenerate, or run: npm run reset-env)',
    );
  }

  log('green', '✓', 'Project cleaned');

  if (opts.setup) {
    runSetup();
    return;
  }

  console.log(
    `\n${COLORS.bold}Next steps:${COLORS.reset}\n` +
    `  npm run setup\n` +
    `  # or in one step: npm run setup:clean\n` +
    `  # reset credentials only: npm run reset-env\n`,
  );
}

main();
