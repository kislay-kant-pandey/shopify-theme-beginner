'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { FILE_HELP, CATEGORIES } = require('./guide');

class ThemeTreeProvider {
  constructor() {
    this._root = undefined;
    this._emitter = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._emitter.event;
  }

  setRoot(root) {
    this._root = root;
    this.refresh();
  }

  refresh() {
    this._emitter.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (!this._root) return [];

    if (!element) {
      return CATEGORIES.filter((c) => fs.existsSync(path.join(this._root, c.dir))).map((c) => {
        const item = new vscode.TreeItem(c.label, vscode.TreeItemCollapsibleState.Collapsed);
        item.iconPath = new vscode.ThemeIcon(c.icon);
        item.tooltip = c.help;
        item.contextValue = 'category';
        item.dirName = c.dir;
        return item;
      });
    }

    if (element.dirName) {
      const dir = path.join(this._root, element.dirName);
      let names = [];
      try {
        names = fs.readdirSync(dir, { withFileTypes: true })
          .filter((d) => d.isFile() && !d.name.startsWith('.'))
          .map((d) => d.name)
          .sort((a, b) => a.localeCompare(b));
      } catch (e) {
        return [];
      }
      return names.map((name) => {
        const rel = element.dirName + '/' + name;
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
        const help = FILE_HELP[rel];
        if (help) item.description = help;
        item.tooltip = help ? rel + '\n' + help : rel;
        item.resourceUri = vscode.Uri.file(path.join(dir, name));
        item.command = { command: 'vscode.open', title: 'Open', arguments: [item.resourceUri] };
        return item;
      });
    }
    return [];
  }
}

module.exports = { ThemeTreeProvider };
