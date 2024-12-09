const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const reminders = require('./reminders');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

  let interval = setInterval(async () => {
    let task = await reminders.checkForReminders(1);
    if (task) {
      vscode.window.showInformationMessage(`Reminder: ${task.title}. ${task.description}`);
    }
  }, 5000);

  context.subscriptions.push({
    dispose: () => clearInterval(interval),
  });
 
  context.subscriptions.push(
    vscode.commands.registerCommand('testdevhealth.viewTasks', async function () {
      const panel = vscode.window.createWebviewPanel(
        'page1',
        'Task List',
        vscode.ViewColumn.One,
        {enableScripts:true}
      );
      let remindersData = await reminders.getReminders();
      let reminderHTML = await reminders.generateReminderHTML(remindersData);
      let webviewContent = getWebViewContent(panel).replace('{{REMINDER_HTML}}', reminderHTML);

      panel.webview.html = webviewContent;
      // panel.webview.html = getWebViewContent(panel);
    })
  );

}

function getWebViewContent(panel) {
  try {
    const filePath = path.join(__dirname, 'htdocs', 'task-list.html');
    const content = fs.readFileSync(filePath, 'utf8');
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'app.js')));
    
    return content.replace('</body>', `<script src="${scriptUri}"></script></script><script>
        document.addEventListener('DOMContentLoaded', () => {
            getTasks(1);
        });
    </script></body>`);
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
