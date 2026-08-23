#!/usr/bin/env node
// Copies package.json's version into every plugin manifest.
// Runs as part of `npm run version`, immediately after `changeset version`.
// With --check it changes nothing and exits 1 if any manifest differs.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPaths = [
  ".claude-plugin/plugin.json",
  "plugins/productivity/.codex-plugin/plugin.json",
  "plugins/productivity/.cursor-plugin/plugin.json",
  "plugins/engineering/.codex-plugin/plugin.json",
  "plugins/engineering/.cursor-plugin/plugin.json",
];

const { version } = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const plugins = pluginPaths.map((relativePath) => {
  const path = join(repo, relativePath);
  const source = readFileSync(path, "utf8");
  return { path, relativePath, source, plugin: JSON.parse(source) };
});
const mismatches = plugins.filter(({ plugin }) => plugin.version !== version);

if (mismatches.length === 0) {
  console.log(`all plugin manifest versions are ${version} — already in sync`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  for (const { relativePath, plugin } of mismatches) {
    console.error(
      `${relativePath} version is ${plugin.version}, package.json is ${version}.`,
    );
  }
  console.error("Run `node scripts/sync-plugin-version.mjs`.");
  process.exit(1);
}

for (const { path, relativePath, source, plugin } of mismatches) {
  // Rewrite only the version line, to keep the key order and the formatting.
  const updated = source.replace(
    /("version"\s*:\s*")[^"]*(")/,
    `$1${version}$2`,
  );

  if (JSON.parse(updated).version !== version) {
    console.error(`Could not find a version field to replace in ${relativePath}.`);
    process.exit(1);
  }

  writeFileSync(path, updated);
  console.log(`${relativePath} version ${plugin.version} -> ${version}`);
}
