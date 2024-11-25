// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "testdevhealth" is now active!');
	

context.subscriptions.push(vscode.commands.registerCommand('testdevhealth.viewTasks', function () {

		var panel = vscode.window.createWebviewPanel(
			'page1',
			'Task List',
			vscode.ViewColumn.One,
			{}
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
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
