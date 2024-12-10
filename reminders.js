/**
 * This class handles the startup logic for the reminder view and checks for reminders that are due for notification.
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const userId = 1;

/**
 * Fetches all reminders from the API.
 * 
 * This asynchronous function sends a GET request to the API endpoint to retrieve all reminders.
 * If the request is successful, it returns the reminders as a JSON object. If an error occurs during the request, 
 * it logs the error to the console and returns an empty array.
 * 
 * @returns {Array} An array of reminders if the request is successful, or an empty array if an error occurs.
 */
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

/**
 * Generates HTML content for displaying a list of reminders.
 * 
 * Takes an array of reminder objects and generates HTML for each reminder. 
 * It fetches the user's tasks, and for each reminder, it finds the associated task 
 * based on the `taskID`. The function then generates HTML with reminder details (task title, reminder time, and creation time), 
 * and includes a delete button that calls the `deleteReminder` function when clicked.
 * 
 * If no reminders are available, it returns a message saying "No reminders available."
 * 
 * @param {Array} reminders - An array of reminder objects to display.
 * @returns {string} A string of HTML content representing the list of reminders, or a message if no reminders are found.
 */
async function generateReminderHTML(reminders) {
  let htmlContent = '';
  const tasks = await getTasksByUserId(userId);

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

/**
 * Fetches tasks associated with a specific user by their user ID.
 * 
 * Sends a GET request to the API endpoint to retrieve the tasks for the given user ID.
 * If the request is successful, it returns the tasks as a JSON object. If the request fails or an error occurs,
 * it logs the error to the console and returns an empty array.
 * 
 * @param {string} id - The ID of the user whose tasks are to be fetched.
 * @returns {Array} An array of tasks, or an empty array if an error occurs.
 */
async function getTasksByUserId(id) {
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

/**
 * Checks for reminders associated with a specific user ID.
 * 
 * It retrieves the current date, the tasks for the user, and all reminder data.
 * The function iterates through the reminders and matches them with the user's tasks by comparing task IDs.
 * If a reminder's time has passed (current date is greater than or equal to the reminder time),
 * it deletes the reminder by calling the deleteReminder function and returns the associated task.
 * If no reminders are found or none are due, the function does not return anything.
 * 
 * @param {string} userId - The ID of the user whose reminders and tasks are to be checked.
 */
async function checkForReminders(userId) {
  let currentDate = new Date();
  let tasks = await getTasksByUserId(1);
  let reminderData = await getReminders();
  for (let reminder of reminderData) {
    for (let task of tasks){
      if (reminder.taskID === task.taskID && task.user_id === userId){
        let reminderDate = new Date(reminder.reminder_time);
        if (currentDate >= reminderDate) {
          deleteReminder(reminder.reminder_id)
          return task;
        }
      }
    }
  }
}

module.exports = {
  getReminders,
  generateReminderHTML,
  checkForReminders,
  getTasksByUserId
};
