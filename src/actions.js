'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const CUSTOM_CSS_STARTER = [
  '/* Your own CSS goes here. It loads on every page of your store.',
  '   Example: make all buttons rounded.',
  '',
  '   .button { border-radius: 999px; }',
  '*/',
  ''
].join('\n');

function sectionTemplate(fileName, title) {
  return [
    '{%- comment -%} ' + fileName + ': edit the HTML below, then add the section in the theme editor. {%- endcomment -%}',
    '<div class="' + fileName + '" style="padding: {{ section.settings.padding }}px;">',
    '  <h2>{{ section.settings.heading }}</h2>',
    '  <p>{{ section.settings.text }}</p>',
    '</div>',
    '',
    '{% schema %}',
    '{',
    '  "name": "' + title + '",',
    '  "settings": [',
    '    { "type": "text", "id": "heading", "label": "Heading", "default": "Hello from my section" },',
    '    { "type": "textarea", "id": "text", "label": "Text", "default": "Edit me in the theme editor." },',
    '    { "type": "range", "id": "padding", "label": "Padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 24 }',
    '  ],',
    '  "presets": [{ "name": "' + title + '" }]',
    '}',
    '{% endschema %}',
    ''
  ].join('\n');
}

function toTitle(fileName) {
  return fileName.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function openFile(fullPath) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fullPath));
  await vscode.window.showTextDocument(doc);
  return doc;
}

async function createSection(root) {
  const name = await vscode.window.showInputBox({
    title: 'Create a new section',
    prompt: 'Name of the section (small letters, numbers and dashes only)',
    placeHolder: 'my-banner',
    validateInput: (v) => (/^[a-z0-9][a-z0-9-]*$/.test(v || '') ? undefined : 'Use small letters, numbers and dashes, e.g. my-banner')
  });
  if (!name) return;

  const dir = path.join(root, 'sections');
  const target = path.join(dir, name + '.liquid');
  if (fs.existsSync(target)) {
    vscode.window.showErrorMessage('A section called "' + name + '" already exists.');
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, sectionTemplate(name, toTitle(name)), 'utf8');
  await openFile(target);
  vscode.window.showInformationMessage('Section created. Add it to a page from the online Theme Editor > Add section.');
}

async function setupCustomCss(root) {
  const cssPath = path.join(root, 'assets', 'custom.css');
  if (!fs.existsSync(cssPath)) {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true });
    fs.writeFileSync(cssPath, CUSTOM_CSS_STARTER, 'utf8');
  }

  const layoutPath = path.join(root, 'layout', 'theme.liquid');
  if (fs.existsSync(layoutPath)) {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(layoutPath));
    const text = doc.getText();
    if (!text.includes('custom.css')) {
      const idx = text.indexOf('</head>');
      if (idx !== -1) {
        const answer = await vscode.window.showInformationMessage(
          'To use custom.css, one line must be added to layout/theme.liquid (just before </head>). Add it now?',
          'Add the line',
          'Not now'
        );
        if (answer === 'Add the line') {
          const edit = new vscode.WorkspaceEdit();
          edit.insert(doc.uri, doc.positionAt(idx), "  {{ 'custom.css' | asset_url | stylesheet_tag }}\n  ");
          await vscode.workspace.applyEdit(edit);
          await doc.save();
        }
      }
    }
  }
  await openFile(cssPath);
}

function runShopify(root, label, command) {
  const terminal = vscode.window.createTerminal({ name: 'Shopify: ' + label, cwd: root });
  terminal.show();
  terminal.sendText(command);
}

async function confirmThenRun(root, label, command, message, button) {
  const answer = await vscode.window.showWarningMessage(message, { modal: true }, button);
  if (answer === button) runShopify(root, label, command);
}

module.exports = { createSection, setupCustomCss, runShopify, confirmThenRun, openFile };
