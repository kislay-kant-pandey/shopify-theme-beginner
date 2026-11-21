'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { ThemeTreeProvider } = require('./src/themeTree');
const { registerHover } = require('./src/hover');
const { TASKS } = require('./src/guide');
const { findThemeRoot } = require('./src/themeRoot');
const actions = require('./src/actions');

const LIQUID_EXTENSION_ID = 'Shopify.theme-check-vscode';

async function activate(context) {
  const tree = new ThemeTreeProvider();
  let root;

  async function reload() {
    root = await findThemeRoot();
    tree.setRoot(root);
    await vscode.commands.executeCommand('setContext', 'shopifyBeginner.isTheme', !!root);
  }

  async function requireRoot() {
    if (!root) await reload();
    if (!root) {
      vscode.window.showWarningMessage('No Shopify theme found. Open the folder that contains layout/, sections/ and templates/.');
    }
    return root;
  }

  await reload();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('shopifyBeginner.themeExplorer', tree),

    vscode.commands.registerCommand('shopifyBeginner.refresh', reload),

    vscode.commands.registerCommand('shopifyBeginner.whatToEdit', async () => {
      const themeRoot = await requireRoot();
      if (!themeRoot) return;

      const pick = await vscode.window.showQuickPick(
        TASKS.map((t) => ({ label: t.label, description: t.hint, task: t })),
        { title: 'What do you want to change?', placeHolder: 'Pick one and the right file opens' }
      );
      if (!pick) return;
      const task = pick.task;

      if (task.special === 'customCss') return actions.setupCustomCss(themeRoot);
      if (task.special === 'newSection') return actions.createSection(themeRoot);

      const found = task.files.find((f) => fs.existsSync(path.join(themeRoot, f)));
      if (!found) {
        vscode.window.showWarningMessage('Could not find the usual file for this in your theme. Look in the "Theme Files" list on the left.');
        return;
      }
      await actions.openFile(path.join(themeRoot, found));
      if (task.note) vscode.window.showInformationMessage(task.note);
    }),

    vscode.commands.registerCommand('shopifyBeginner.newSection', async () => {
      const themeRoot = await requireRoot();
      if (themeRoot) await actions.createSection(themeRoot);
    }),

    vscode.commands.registerCommand('shopifyBeginner.addCustomCss', async () => {
      const themeRoot = await requireRoot();
      if (themeRoot) await actions.setupCustomCss(themeRoot);
    }),

    vscode.commands.registerCommand('shopifyBeginner.preview', async () => {
      const themeRoot = await requireRoot();
      if (themeRoot) actions.runShopify(themeRoot, 'preview', 'shopify theme dev');
    }),

    vscode.commands.registerCommand('shopifyBeginner.push', async () => {
      const themeRoot = await requireRoot();
      if (!themeRoot) return;
      await actions.confirmThenRun(
        themeRoot,
        'upload',
        'shopify theme push',
        'This sends your local theme files to your Shopify store. If you pick your live theme, visitors will see the changes. Tip: choose an unpublished copy first.',
        'Upload'
      );
    }),

    vscode.commands.registerCommand('shopifyBeginner.pull', async () => {
      const themeRoot = await requireRoot();
      if (!themeRoot) return;
      await actions.confirmThenRun(
        themeRoot,
        'download',
        'shopify theme pull',
        'This downloads the theme from your store and can overwrite files here that you have not uploaded yet.',
        'Download'
      );
    })
  );

  // Refresh the file list when files are added/removed.
  const watcher = vscode.workspace.createFileSystemWatcher('**/{layout,templates,sections,snippets,config,assets,locales}/*');
  let timer;
  const soon = () => {
    clearTimeout(timer);
    timer = setTimeout(() => tree.refresh(), 300);
  };
  watcher.onDidCreate(soon);
  watcher.onDidDelete(soon);
  context.subscriptions.push(watcher, { dispose: () => clearTimeout(timer) });

  registerHover(context);

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  status.text = '$(question) Shopify: what to change?';
  status.tooltip = 'Pick what you want to change and the right file opens';
  status.command = 'shopifyBeginner.whatToEdit';
  if (root) status.show();
  context.subscriptions.push(status);

  // One-time tip: colored Liquid code needs the official Shopify extension.
  if (root && !vscode.extensions.getExtension(LIQUID_EXTENSION_ID) && !context.globalState.get('liquidTipShown')) {
    await context.globalState.update('liquidTipShown', true);
    const answer = await vscode.window.showInformationMessage(
      'For colored Liquid code and error checking, install the official "Shopify Liquid" extension.',
      'Install',
      'Skip'
    );
    if (answer === 'Install') {
      vscode.commands.executeCommand('workbench.extensions.installExtension', LIQUID_EXTENSION_ID);
    }
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
