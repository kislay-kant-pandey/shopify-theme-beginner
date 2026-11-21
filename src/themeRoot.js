'use strict';
const vscode = require('vscode');
const path = require('path');

/** Finds the folder that holds layout/theme.liquid (the theme root). */
async function findThemeRoot() {
  const hits = await vscode.workspace.findFiles('**/layout/theme.liquid', '**/node_modules/**', 5);
  if (hits.length === 0) return undefined;
  hits.sort((a, b) => a.fsPath.length - b.fsPath.length);
  return path.dirname(path.dirname(hits[0].fsPath));
}

module.exports = { findThemeRoot };
