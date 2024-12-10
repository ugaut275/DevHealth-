//*This class is used to register the commands and allocate webviews for each command according to the html documents created. *//
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const reminders = require('./reminders');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  
  //This is for the interval spacing to check whether a reminder time is passed and if so it will display them accordingly 
  let interval = setInterval(async () => {
    let task = await reminders.checkForReminders(1);
    if (task) {
      vscode.window.showInformationMessage(`Reminder: ${task.title}. ${task.description}`);
    }
  }, 5000);

  context.subscriptions.push({
    dispose: () => clearInterval(interval),
  });
  
  //This registers the viewTasks command and provides the proper html document for the panel to go to when the command is ran
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

    //This registers the login command and provides the proper html document for the panel to go to when the command is ran
    context.subscriptions.push(
      vscode.commands.registerCommand('testdevhealth.login', async function () {
        const panel = vscode.window.createWebviewPanel(
          'loginPage',
          'Login - DevHealth',
          vscode.ViewColumn.One,
          { enableScripts: true }
        );
        
        //Retrieves the proper html document to change the webview
        panel.webview.html = getLoginPageContent(panel.webview, context.extensionUri);
        
        //This block is used to check the redirect commands in the login page script and get rid of the current panel and move it to the next panel by running the command.
        panel.webview.onDidReceiveMessage(
          (message) => {
            if (message.command === "navigateToTaskList") {
              panel.dispose();
              vscode.commands.executeCommand("testdevhealth.viewTasks");
            } else if (message.command === "navigateToCreateUser") {
              panel.dispose();
              vscode.commands.executeCommand("testdevhealth.createUser");
            }
          },
          undefined,
          context.subscriptions
        );
      })
    );

    //This registers the createUser command and provides the proper html document for the panel to go to when the command is ran
    context.subscriptions.push(
      vscode.commands.registerCommand('testdevhealth.createUser', async function() {
        const panel = vscode.window.createWebviewPanel(
          `createUser`,
          `Create User - DevHealth`,
          vscode.ViewColumn.One,
          {enableScripts: true}
        );
        //Retrieves the proper html document to change the webview
        panel.webview.html = getCreateUserPageContent(panel.webview,context.extensionUri);

        //This block is used to check the redirect commands in the create user page script and remove the current panel and move it to the next panel by running the command 
        panel.webview.onDidReceiveMessage(

          (message) => {
            if(message.command === "navigateToLogin"){
              panel.dispose();
              vscode.commands.executeCommand("testdevhealth.login");
            }
          },
          undefined,
          context.subscriptions
        );
      })
    );
    
    /**
     * Gets the proper html path for the new-user page 
     * @param {*} webview 
     * @param {*} extensionUri 
     * @returns html path 
     */
    function getCreateUserPageContent(webview, extensionUri) {
      try {
        const filePath = vscode.Uri.joinPath(extensionUri, 'htdocs', 'new-user.html');
        const loginHTML = fs.readFileSync(filePath.fsPath, 'utf8');
        return loginHTML;
      } catch (error) {
        console.error("Error reading the login page file:", error);
        return `<html><body><h1>Error loading content</h1><p>${error.message}</p></body></html>`;
      }
    }
  
  /**
   * Gets the proper html path for the login-page 
   * @param {*} webview 
   * @param {*} extensionUri 
   * @returns html path
   */
  function getLoginPageContent(webview, extensionUri) {
    try {
      const filePath = vscode.Uri.joinPath(extensionUri, 'htdocs', 'login-page.html');
      const loginHTML = fs.readFileSync(filePath.fsPath, 'utf8');
      return loginHTML;
    } catch (error) {
      console.error("Error reading the login page file:", error);
      return `<html><body><h1>Error loading content</h1><p>${error.message}</p></body></html>`;
    }
  }

}

/**
 * Generates the html content for a webview and the proper path
 * @param {*} panel 
 * @returns The html content fro the webview, with the JS script injected
 */
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
