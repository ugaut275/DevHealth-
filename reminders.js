const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
// TODO: delete once login functioning
const userId = 1;

async function getReminders() {
  try {
    const response = await fetch(`http://35.225.30.86:8080/api/reminders/`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
}

async function generateReminderHTML(reminders) {
  let htmlContent = '';
  const tasks = await getTasksById(userId);

  for (const reminder of reminders) {
    const task = await tasks.find(t => t.taskID === reminder.taskID);

    htmlContent += `
      <div class="reminder-item">
        <div class="reminder-details">
          <h2>Reminder for Task: ${task.title}</h2> 
          <p>Reminder Time: ${new Date(reminder.reminder_time).toLocaleString()}</p>
          <p>Created At: ${new Date(reminder.created_at).toLocaleString()}</p>
        </div>
        <button class="delete-btn" onclick="deleteReminder(${reminder.reminder_id})">Delete</button>
      </div>
    `;
  }

  return htmlContent || '<p>No reminders available.</p>';
}



async function getTasksById(id) {
  try {
    const response = await fetch(`http://35.225.30.86:8080/api/tasks/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

function getWebViewContent(panel) {
  try {
    const filePath = path.join(__dirname, 'htdocs', 'reminder-list.html');
    const content = fs.readFileSync(filePath, 'utf8');
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'reminders.js')));
    
    return content.replace('</body>', `<script src="${scriptUri}"></script></body>`);
  } catch (error) {
    console.error("Error reading the file:", error);
    return `<html><body><h1>Error loading content</h1><p>${error.message}</p></body></html>`;
  }
}




async function showAddMenu() {
 const userId = 1;
  try {
    const response = await fetch(`http://35.225.30.86:8080/api/tasks/${userId}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText}`
      );
    }

    const tasks = await response.json();
    const addPopUp = document.createElement("div");
    addPopUp.classList.add("addPopUp");

    addPopUp.innerHTML = `
<div class="addPopUp-content">
<h2>Add Reminder</h2>
<form id="addReminderForm">
<label for="taskSelect">Select Task:</label>
<select id="taskSelect" required>
  ${tasks
    .map(
      (task) => `<option value="${task.taskID}">${task.title}</option>`
    )
    .join("")}
</select>

<label for="reminderDate">Reminder Date:</label>
<input type="date" id="reminderDate" required />

<label for="reminderTime">Reminder Time:</label>
<input type="time" id="reminderTime" required />

<div class="addPopUp-buttons">
  <button type="submit" class="save-button">Save</button>
  <button type="button" class="cancel-button">Cancel</button>
</div>
</form>
</div>
`;

    document.body.appendChild(addPopUp);
    const form = addPopUp.querySelector("#addReminderForm");
    form.addEventListener("submit", async (event) => await addReminder(event, addPopUp));

    const cancelButton = addPopUp.querySelector(".cancel-button");
    cancelButton.addEventListener("click", () => {
      addPopUp.remove();
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

async function addReminder(event, addPopUp) {
    event.preventDefault();
    const taskId = document.querySelector("#taskSelect").value;
    const reminderDate = document.querySelector("#reminderDate").value;
    const reminderTime = document.querySelector("#reminderTime").value;

    if (taskId && reminderDate) {
      let newReminder = {
        taskID: taskId,
        reminder_time: reminderDate + " " + reminderTime + ":00",
      };
      try {
        await fetch("http://35.225.30.86:8080/api/reminders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newReminder),
        });
        // TODO: update HTML
      } catch (error) {
        console.log(error);
      }
      addPopUp.remove();
    }
  }

async function deleteReminder(reminderId) {
  try {
    await fetch(`http://35.225.30.86:8080/api/reminders/${reminderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
      // TODO: update HTML
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getReminders,
  generateReminderHTML,
  getWebViewContent
};
