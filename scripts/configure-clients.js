#!/usr/bin/env node

/**
 * Wire the Jira Worklog MCP server into installed AI clients.
 *
 * Default scope is global (home-directory configs). Project scope is optional.
 *
 * Usage:
 *   npm run configure-clients
 *   npm run configure-clients -- --dry-run
 *   npm run configure-clients -- --cursor --force
 *   npm run configure-clients -- --uninstall --all
 *   npm run configure-clients -- --scope project --cursor
 *
 * Uses only Node.js stdlib (same style as scripts/install.js).
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MCP_ENTRY = path.join(ROOT, 'dist', 'interfaces', 'mcp', 'server.js');
const ENV_FILE = path.join(ROOT, '.env');
const SERVER_NAME = 'jira-worklog';
const HOME = os.homedir();
const IS_WIN = process.platform === 'win32';

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

function commandExists(cmd) {
  const probe = IS_WIN ? 'where' : 'which';
  const result = spawnSync(probe, [cmd], { encoding: 'utf8', shell: IS_WIN });
  return result.status === 0;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function backupFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

function writeJson(filePath, data, dryRun) {
  const next = `${JSON.stringify(data, null, 2)}\n`;
  if (dryRun) {
    console.log(`\n${COLORS.dim}--- would write ${filePath} ---${COLORS.reset}`);
    console.log(next);
    return { wrote: false, backup: null };
  }
  ensureDir(filePath);
  const backup = backupFile(filePath);
  fs.writeFileSync(filePath, next, 'utf8');
  return { wrote: true, backup };
}

function stdioEntry({ includeEnvFile = false, includeCwd = false } = {}) {
  const entry = {
    command: 'node',
    args: [MCP_ENTRY],
  };
  if (includeEnvFile) {
    entry.envFile = ENV_FILE;
  }
  if (includeCwd) {
    entry.cwd = ROOT;
  }
  return entry;
}

function vscodeEntry() {
  return {
    type: 'stdio',
    command: 'node',
    args: [MCP_ENTRY],
    envFile: ENV_FILE,
    cwd: ROOT,
  };
}

function mergeJsonServer(filePath, topKey, entry, options) {
  const { dryRun, force, uninstall } = options;
  const data = readJson(filePath);
  if (!data[topKey] || typeof data[topKey] !== 'object') {
    data[topKey] = {};
  }

  const exists = Object.prototype.hasOwnProperty.call(data[topKey], SERVER_NAME);

  if (uninstall) {
    if (!exists) {
      log('yellow', '!', `${filePath}: ${SERVER_NAME} not present — nothing to remove`);
      return 'skipped';
    }
    delete data[topKey][SERVER_NAME];
    if (Object.keys(data[topKey]).length === 0) {
      delete data[topKey];
    }
    const result = writeJson(filePath, data, dryRun);
    if (!dryRun) {
      log('green', '✓', `Removed ${SERVER_NAME} from ${filePath}`);
      if (result.backup) {
        log('dim', '·', `Backup: ${result.backup}`);
      }
    } else {
      log('green', '✓', `Dry-run: would remove ${SERVER_NAME} from ${filePath}`);
    }
    return 'removed';
  }

  if (exists && !force) {
    log('yellow', '!', `${filePath}: ${SERVER_NAME} already exists — pass --force to overwrite`);
    return 'exists';
  }

  data[topKey][SERVER_NAME] = entry;
  const result = writeJson(filePath, data, dryRun);
  if (!dryRun) {
    log('green', '✓', `${exists ? 'Updated' : 'Added'} ${SERVER_NAME} in ${filePath}`);
    if (result.backup) {
      log('dim', '·', `Backup: ${result.backup}`);
    }
  } else {
    log('green', '✓', `Dry-run: would ${exists ? 'update' : 'add'} ${SERVER_NAME} in ${filePath}`);
  }
  return exists ? 'updated' : 'added';
}

function appendTomlBlock(filePath, block, options) {
  const { dryRun, force, uninstall } = options;
  const marker = `[mcp_servers.${SERVER_NAME}]`;
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const hasSection = content.includes(marker);

  if (uninstall) {
    if (!hasSection) {
      log('yellow', '!', `${filePath}: ${SERVER_NAME} not present — nothing to remove`);
      return 'skipped';
    }
    content = content.replace(
      new RegExp(`\\n?\\[mcp_servers\\.${SERVER_NAME}\\][\\s\\S]*?(?=\\n\\[|$)`),
      '\n',
    );
    if (dryRun) {
      log('green', '✓', `Dry-run: would remove ${SERVER_NAME} from ${filePath}`);
      console.log(`\n${COLORS.dim}--- would write ${filePath} ---${COLORS.reset}\n${content}`);
      return 'removed';
    }
    const backup = backupFile(filePath);
    fs.writeFileSync(filePath, content.trimEnd() + '\n', 'utf8');
    log('green', '✓', `Removed ${SERVER_NAME} from ${filePath}`);
    if (backup) {
      log('dim', '·', `Backup: ${backup}`);
    }
    return 'removed';
  }

  if (hasSection && !force) {
    log('yellow', '!', `${filePath}: ${SERVER_NAME} already exists — pass --force to overwrite`);
    return 'exists';
  }

  if (hasSection) {
    content = content.replace(
      new RegExp(`\\n?\\[mcp_servers\\.${SERVER_NAME}\\][\\s\\S]*?(?=\\n\\[|$)`),
      '\n',
    );
  }

  const next = `${content.trimEnd()}\n\n${block.trim()}\n`;
  if (dryRun) {
    log('green', '✓', `Dry-run: would ${hasSection ? 'update' : 'add'} ${SERVER_NAME} in ${filePath}`);
    console.log(`\n${COLORS.dim}--- would write ${filePath} ---${COLORS.reset}\n${next}`);
    return hasSection ? 'updated' : 'added';
  }

  ensureDir(filePath);
  const backup = backupFile(filePath);
  fs.writeFileSync(filePath, next, 'utf8');
  log('green', '✓', `${hasSection ? 'Updated' : 'Added'} ${SERVER_NAME} in ${filePath}`);
  if (backup) {
    log('dim', '·', `Backup: ${backup}`);
  }
  return hasSection ? 'updated' : 'added';
}

function appendYamlBlock(filePath, blockLines, options) {
  const { dryRun, force, uninstall } = options;
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const hasServers = /^mcp_servers\s*:/m.test(content);
  const hasEntry = new RegExp(`^\\s{2}${SERVER_NAME}\\s*:`, 'm').test(content);

  if (uninstall) {
    if (!hasEntry) {
      log('yellow', '!', `${filePath}: ${SERVER_NAME} not present — nothing to remove`);
      return 'skipped';
    }
    content = content.replace(
      new RegExp(`\\n? {2}${SERVER_NAME}:[\\s\\S]*?(?=\\n {2}\\w|\\n\\w|$)`),
      '\n',
    );
    if (dryRun) {
      log('green', '✓', `Dry-run: would remove ${SERVER_NAME} from ${filePath}`);
      console.log(`\n${COLORS.dim}--- would write ${filePath} ---${COLORS.reset}\n${content}`);
      return 'removed';
    }
    const backup = backupFile(filePath);
    fs.writeFileSync(filePath, content.trimEnd() + '\n', 'utf8');
    log('green', '✓', `Removed ${SERVER_NAME} from ${filePath}`);
    if (backup) {
      log('dim', '·', `Backup: ${backup}`);
    }
    return 'removed';
  }

  if (hasEntry && !force) {
    log('yellow', '!', `${filePath}: ${SERVER_NAME} already exists — pass --force to overwrite`);
    return 'exists';
  }

  if (hasEntry) {
    content = content.replace(
      new RegExp(`\\n? {2}${SERVER_NAME}:[\\s\\S]*?(?=\\n {2}\\w|\\n\\w|$)`),
      '\n',
    );
  }

  let next;
  if (!hasServers) {
    next = `${content.trimEnd()}\n\nmcp_servers:\n${blockLines}\n`;
  } else {
    next = `${content.trimEnd()}\n${blockLines}\n`;
  }

  if (dryRun) {
    log('green', '✓', `Dry-run: would ${hasEntry ? 'update' : 'add'} ${SERVER_NAME} in ${filePath}`);
    console.log(`\n${COLORS.dim}--- would write ${filePath} ---${COLORS.reset}\n${next}`);
    return hasEntry ? 'updated' : 'added';
  }

  ensureDir(filePath);
  const backup = backupFile(filePath);
  fs.writeFileSync(filePath, next, 'utf8');
  log('green', '✓', `${hasEntry ? 'Updated' : 'Added'} ${SERVER_NAME} in ${filePath}`);
  if (backup) {
    log('dim', '·', `Backup: ${backup}`);
  }
  return hasEntry ? 'updated' : 'added';
}

function tryCliAdd(cli, args, dryRun) {
  if (dryRun) {
    log('green', '✓', `Dry-run: would run \`${cli} ${args.join(' ')}\``);
    return true;
  }
  const result = spawnSync(cli, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: IS_WIN,
  });
  return result.status === 0;
}

function cursorPaths(scope) {
  if (scope === 'project') {
    return path.join(ROOT, '.cursor', 'mcp.json');
  }
  return path.join(HOME, '.cursor', 'mcp.json');
}

function vscodePaths(scope) {
  if (scope === 'project') {
    return path.join(ROOT, '.vscode', 'mcp.json');
  }
  if (IS_WIN) {
    return path.join(process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming'), 'Code', 'User', 'mcp.json');
  }
  return path.join(HOME, 'Library', 'Application Support', 'Code', 'User', 'mcp.json');
}

function copilotCliPaths(scope) {
  if (scope === 'project') {
    return path.join(ROOT, '.mcp.json');
  }
  return path.join(HOME, '.copilot', 'mcp-config.json');
}

function copilotCliEntry() {
  return {
    type: 'local',
    command: 'node',
    args: [MCP_ENTRY],
    tools: ['*'],
  };
}

function claudeCodePaths(scope) {
  if (scope === 'project') {
    return path.join(ROOT, '.mcp.json');
  }
  return path.join(HOME, '.claude.json');
}

function claudeDesktopPath() {
  if (IS_WIN) {
    return path.join(process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  }
  return path.join(HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
}

function codexPaths(scope) {
  if (scope === 'project') {
    return path.join(ROOT, '.codex', 'config.toml');
  }
  return path.join(HOME, '.codex', 'config.toml');
}

function hermesPaths(scope) {
  if (scope === 'project') {
    return path.join(ROOT, '.hermes', 'config.yaml');
  }
  if (process.env.HERMES_HOME) {
    return path.join(process.env.HERMES_HOME, 'config.yaml');
  }
  return path.join(HOME, '.hermes', 'config.yaml');
}

function detectClients() {
  return {
    cursor:
      commandExists('agent') ||
      fs.existsSync(path.join(HOME, '.cursor')) ||
      fs.existsSync(path.join(HOME, 'Applications', 'Cursor.app')) ||
      fs.existsSync('/Applications/Cursor.app'),
    vscode: commandExists('code') || fs.existsSync(vscodePaths('global')),
    'copilot-cli':
      commandExists('copilot') ||
      fs.existsSync(path.join(HOME, '.copilot')) ||
      fs.existsSync(copilotCliPaths('global')),
    'claude-code': commandExists('claude') || fs.existsSync(path.join(HOME, '.claude.json')),
    'claude-desktop':
      fs.existsSync(claudeDesktopPath()) ||
      fs.existsSync('/Applications/Claude.app') ||
      fs.existsSync(path.join(HOME, 'AppData', 'Local', 'AnthropicClaude')),
    codex: commandExists('codex') || fs.existsSync(path.join(HOME, '.codex')),
    hermes: commandExists('hermes') || fs.existsSync(path.join(HOME, '.hermes')),
  };
}

const CLIENTS = {
  cursor: {
    label: 'Cursor',
    configure(scope, options) {
      const filePath = cursorPaths(scope);
      return mergeJsonServer(
        filePath,
        'mcpServers',
        stdioEntry({ includeEnvFile: true }),
        options,
      );
    },
  },
  vscode: {
    label: 'GitHub Copilot (VS Code)',
    configure(scope, options) {
      const filePath = vscodePaths(scope);
      return mergeJsonServer(filePath, 'servers', vscodeEntry(), options);
    },
  },
  'copilot-cli': {
    label: 'GitHub Copilot CLI',
    configure(scope, options) {
      if (scope === 'global' && commandExists('copilot') && !options.uninstall) {
        if (options.force) {
          tryCliAdd('copilot', ['mcp', 'remove', SERVER_NAME], options.dryRun);
        }
        if (tryCliAdd('copilot', ['mcp', 'add', SERVER_NAME, '--', 'node', MCP_ENTRY], options.dryRun)) {
          log('green', '✓', 'Configured via `copilot mcp add`');
          return 'added';
        }
        log('yellow', '!', '`copilot mcp add` failed — falling back to ~/.copilot/mcp-config.json');
      }
      if (options.uninstall && scope === 'global' && commandExists('copilot')) {
        if (tryCliAdd('copilot', ['mcp', 'remove', SERVER_NAME], options.dryRun)) {
          log('green', '✓', 'Removed via `copilot mcp remove`');
          return 'removed';
        }
      }
      return mergeJsonServer(
        copilotCliPaths(scope),
        'mcpServers',
        copilotCliEntry(),
        options,
      );
    },
  },
  'claude-code': {
    label: 'Claude Code',
    configure(scope, options) {
      if (scope === 'global' && commandExists('claude') && !options.uninstall) {
        const args = ['mcp', 'add', SERVER_NAME, '--', 'node', MCP_ENTRY];
        if (options.force) {
          // Claude CLI may error if exists; fall through to file merge with force.
        }
        if (tryCliAdd('claude', args, options.dryRun)) {
          log('green', '✓', 'Configured via `claude mcp add`');
          return 'added';
        }
        log('yellow', '!', '`claude mcp add` failed — falling back to config file');
      }
      if (options.uninstall && scope === 'global' && commandExists('claude')) {
        if (tryCliAdd('claude', ['mcp', 'remove', SERVER_NAME], options.dryRun)) {
          log('green', '✓', 'Removed via `claude mcp remove`');
          return 'removed';
        }
      }
      return mergeJsonServer(
        claudeCodePaths(scope),
        'mcpServers',
        stdioEntry(),
        options,
      );
    },
  },
  'claude-desktop': {
    label: 'Claude Desktop',
    configure(scope, options) {
      if (scope === 'project') {
        log('yellow', '!', 'Claude Desktop has no project scope — using global config');
      }
      return mergeJsonServer(
        claudeDesktopPath(),
        'mcpServers',
        stdioEntry(),
        options,
      );
    },
  },
  codex: {
    label: 'Codex',
    configure(scope, options) {
      if (scope === 'global' && commandExists('codex') && !options.uninstall) {
        if (tryCliAdd('codex', ['mcp', 'add', SERVER_NAME, '--', 'node', MCP_ENTRY], options.dryRun)) {
          log('green', '✓', 'Configured via `codex mcp add`');
          return 'added';
        }
        log('yellow', '!', '`codex mcp add` failed — falling back to config.toml');
      }
      if (options.uninstall && scope === 'global' && commandExists('codex')) {
        if (tryCliAdd('codex', ['mcp', 'remove', SERVER_NAME], options.dryRun)) {
          log('green', '✓', 'Removed via `codex mcp remove`');
          return 'removed';
        }
      }
      return appendTomlBlock(
        codexPaths(scope),
        [
          `[mcp_servers.${SERVER_NAME}]`,
          'command = "node"',
          `args = [${JSON.stringify(MCP_ENTRY)}]`,
          'enabled = true',
        ].join('\n'),
        options,
      );
    },
  },
  hermes: {
    label: 'Hermes Agent',
    configure(scope, options) {
      if (scope === 'global' && commandExists('hermes') && !options.uninstall) {
        const args = ['mcp', 'add', SERVER_NAME, '--', 'node', MCP_ENTRY];
        if (tryCliAdd('hermes', args, options.dryRun)) {
          log('green', '✓', 'Configured via `hermes mcp add`');
          return 'added';
        }
        log('yellow', '!', '`hermes mcp add` failed — falling back to config.yaml');
      }
      const block = [
        `  ${SERVER_NAME}:`,
        '    command: "node"',
        '    args:',
        `      - ${JSON.stringify(MCP_ENTRY)}`,
        '    enabled: true',
      ].join('\n');
      return appendYamlBlock(hermesPaths(scope), block, options);
    },
  },
};

function printHelp() {
  console.log(`
${COLORS.bold}Jira Worklog MCP — configure AI clients${COLORS.reset}

Usage:
  npm run configure-clients -- [options]

Options:
  --all                 Configure every detected client (default if no client flag)
  --cursor              Cursor (~/.cursor/mcp.json)
  --vscode              GitHub Copilot in VS Code (user mcp.json / .vscode/mcp.json)
  --copilot-cli         GitHub Copilot CLI (~/.copilot/mcp-config.json)
  --claude-code         Claude Code
  --claude-desktop      Claude Desktop
  --codex               Codex CLI
  --hermes              Hermes Agent
  --scope global|project   Config scope (default: global)
  --dry-run             Print actions without writing
  --force               Overwrite an existing jira-worklog entry
  --uninstall           Remove jira-worklog from selected clients
  --help                Show this help

Examples:
  npm run configure-clients -- --dry-run
  npm run configure-clients -- --cursor --force
  npm run configure-clients -- --all
  npm run configure-clients -- --uninstall --cursor
`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    force: false,
    uninstall: false,
    scope: 'global',
    help: false,
    selected: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--uninstall':
        options.uninstall = true;
        break;
      case '--all':
        options.selected.push('all');
        break;
      case '--cursor':
      case '--vscode':
      case '--copilot-cli':
      case '--claude-code':
      case '--claude-desktop':
      case '--codex':
      case '--hermes':
        options.selected.push(arg.slice(2));
        break;
      case '--scope':
        options.scope = argv[i + 1];
        i += 1;
        if (options.scope !== 'global' && options.scope !== 'project') {
          fail('--scope must be global or project');
        }
        break;
      default:
        fail(`Unknown argument: ${arg} (pass --help)`);
    }
  }

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  console.log(`${COLORS.bold}Jira Worklog MCP — configure clients${COLORS.reset}`);
  console.log(`Scope: ${options.scope}${options.dryRun ? ' (dry-run)' : ''}${options.uninstall ? ' (uninstall)' : ''}`);

  if (!fs.existsSync(MCP_ENTRY)) {
    fail(`MCP entry not found: ${MCP_ENTRY}\n  Run \`npm run setup\` (or \`npm run build\`) first.`);
  }
  log('green', '✓', `MCP entry: ${MCP_ENTRY}`);

  if (!fs.existsSync(ENV_FILE)) {
    log('yellow', '!', `.env missing at ${ENV_FILE} — create it before using real Jira`);
  }

  const detected = detectClients();
  step('Detected clients');
  for (const [id, client] of Object.entries(CLIENTS)) {
    log(detected[id] ? 'green' : 'dim', detected[id] ? '✓' : '·', `${client.label}${detected[id] ? '' : ' (not detected)'}`);
  }

  let targets = options.selected.filter((id) => id !== 'all');
  if (options.selected.includes('all') || targets.length === 0) {
    targets = Object.keys(CLIENTS).filter((id) => detected[id]);
    if (targets.length === 0) {
      fail('No AI clients detected. Pass an explicit flag (e.g. --cursor) to configure anyway.');
    }
  }

  // Allow explicit flags even if not detected.
  for (const id of options.selected) {
    if (id !== 'all' && !targets.includes(id)) {
      targets.push(id);
    }
  }

  step(options.uninstall ? 'Removing MCP config' : 'Writing MCP config');
  for (const id of targets) {
    const client = CLIENTS[id];
    if (!client) {
      fail(`Unknown client: ${id}`);
    }
    console.log(`\n${COLORS.bold}${client.label}${COLORS.reset}`);
    client.configure(options.scope, options);
  }

  console.log(
    `\n${COLORS.bold}Next steps:${COLORS.reset}\n` +
      `  1. Ensure ${ENV_FILE} has Jira credentials (or USE_FAKE_JIRA=true).\n` +
      `  2. Restart / reload each configured client.\n` +
      `  3. For Cursor: Settings → Tools & MCP, or \`agent mcp list-tools ${SERVER_NAME}\`.\n` +
      `  4. Manual guides: docs/mcp-clients/\n`,
  );

  log('green', '✓', options.dryRun ? 'Dry-run complete' : 'Configure complete');
}

main();
