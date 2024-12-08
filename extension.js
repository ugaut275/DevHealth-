const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  console.log('Congratulations, your extension "testdevhealth" is now active!');

 
  context.subscriptions.push(
    vscode.commands.registerCommand('testdevhealth.viewTasks', function () {
      const panel = vscode.window.createWebviewPanel(
        'page1',
        'Task List',
        vscode.ViewColumn.One,
        {enableScripts:true}
      );
      panel.webview.html = getWebViewContent();
    })
  );
}

function getWebViewContent() {
  try {
    const filePath = path.join(__dirname, 'htdocs', 'task-list.html');
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error("Error reading the file:", error);
    return `<html><body><h1>Error loading content</h1><p>${error.message}</p></body></html>`;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
