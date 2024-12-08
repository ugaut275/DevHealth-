const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


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

function generateReminderHTML(reminders) {
  let htmlContent = '';
  reminders.forEach(reminder => {
    htmlContent += `
      <div class="reminder-item">
        <div class="reminder-details">
          <h2>Reminder for Task ID: ${reminder.taskID}</h2>
          <p>Reminder Time: ${new Date(reminder.reminder_time).toLocaleString()}</p>
          <p>Created At: ${new Date(reminder.created_at).toLocaleString()}</p>
        </div>
        </div>
      </div>
    `;
  });
  return htmlContent || '<p>No reminders available.</p>';
}

function getWebViewContent() {
  try {
    const filePath = path.join(__dirname, 'htdocs', 'reminder-list.html');
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error("Error reading the file:", error);
    return `<html><body><h1>Error loading content</h1><p>${error.message}</p></body></html>`;
  }
}

module.exports = {
  getReminders,
  generateReminderHTML,
  getWebViewContent
};
