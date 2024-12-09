const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const reminders = require('./reminders');

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

  context.subscriptions.push(
    vscode.commands.registerCommand('testdevhealth.viewReminders', async function () {
      const panel = vscode.window.createWebviewPanel(
        'page2',
        'Reminder List',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
  
      let remindersData = await reminders.getReminders();
      let reminderHTML = await reminders.generateReminderHTML(remindersData, 1);
      let webviewContent = reminders.getWebViewContent(panel).replace('{{REMINDER_HTML}}', reminderHTML);

      panel.webview.html = webviewContent;
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
