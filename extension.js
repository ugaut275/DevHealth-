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


      async function getTasks(taskId){
          try {
              const response = await fetch(`http://35.225.30.86:8080/api/tasks/${taskId}`); 
              if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const data = await response.json();
              displayTasks(data)
              } catch (error) {
                  console.error('Error fetching data:', error);
              }
                  }
                  function displayTasks(tasks) {
          const taskList = document.querySelector('.task-list');
          taskList.innerHTML = ''; // Clear existing tasks

          tasks.forEach(task => {
              const taskItem = document.createElement('div');
              taskItem.classList.add('task-item');
              taskItem.innerHTML = `
                  <div class="task-details">
                      <h2>${task.title}</h2>
                      <p>Due Date: ${new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                      <p>Status for ${task.title}:</p>
                      <div class="status-buttons" data-task-id="${task.taskID}">
                          <button class="status-button ${task.status === 'Not Started' ? 'active' : ''}" data-status="not-started">Not Started</button>
                          <button class="status-button ${task.status === 'In Progress' ? 'active' : ''}" data-status="in-progress">In Progress</button>
                          <button class="status-button ${task.status === 'Completed' ? 'active' : ''}" data-status="completed">Completed</button>
                      </div>
                      <button onclick="viewTaskDetails(${task.taskID})">Details</button>
                  </div>
              `;
              taskList.appendChild(taskItem);
          });
      }


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
