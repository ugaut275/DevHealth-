const vscode = acquireVsCodeApi();
let displayedYear = new Date().getFullYear();
let displayedMonth = new Date().getMonth();

// Fetches a  task by its ID, processes the response, filters tasks based on status, 
// and stores the filtered tasks in a global variable.
async function getTasks(taskId) {
  try {
      const response = await fetch(`http://35.225.30.86:8080/api/tasks/${taskId}`);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      displayTasks(data);
      const dofa = data.filter(item => item.status !== 3);
      window.allTasks = dofa;
  } catch (error) {
      console.error('Error fetching data:', error);
      window.allTasks = [];
  }
}

// Adds a new task by sending the task data to the server via a POST request.
async function addTask(taskData) {
  try {
      const response = await fetch('http://35.225.30.86:8080/api/tasks', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(taskData)
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Task added successfully:', data);
  } catch (error) {
      console.error('Error adding task:', error);
  }
}

// Updates an existing task with new data by sending a PUT request to the server.
async function updateTask(updateData) {
  try {
      const response = await fetch(`http://35.225.30.86:8080/api/tasks/${updateData.taskID}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
      });
  } catch (error) {
      // Error handling is not implemented here.
  }
}

// Displays a list of tasks in the DOM, creating HTML elements for each task and appending them to the task list.
function displayTasks(tasks) {
  const taskList = document.querySelector('.task-list');
  taskList.innerHTML = ''; // Clears existing tasks in the list

  // Creates a new task item for each task and appends it to the task list.
  tasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.classList.add(`task-item-${task.priority}`);
      taskItem.innerHTML = `
      <div class="bofa-grid">
          <div class="task-details">
              <h3>${task.title}</h3>
          </div>
          <div>
            <button id="pofa" class = "cancel-button">❌</button>
          </div>
      </div>
      <span>Due Date: ${new Date(task.due_date).toLocaleDateString()}</span>
      <div class="status-buttons" data-task-id="${task.taskID}">
          <span id="toDelete" style ="display:none;">${task.taskID}</span>
          <p>${task.description}</p>
          <select class="status-button ${task.status === 1 ? 'Not-Started' : task.status === 2 ? 'In-Progress' : task.status === 3 ? 'Completed' : ''}" value="${task.status}">
              <option value="1" ${task.status === 1 ? 'selected' : ''}>Not Started</option>
              <option value="2" ${task.status === 2 ? 'selected' : ''}>In Progress</option>
              <option value="3" ${task.status === 3 ? 'selected' : ''}>Completed</option>
          </select>
      </div>
      `;
      taskList.appendChild(taskItem);
  });

  // Attaches event listeners for canceling tasks and handling status updates.
  attachCancelButtonListeners();
  deleteButtonListeners();
}

// Attaches click event listeners to cancel buttons for task removal.
function attachCancelButtonListeners() {
  const taskList = document.querySelector('.task-list');
  taskList.addEventListener('click', (event) => {
      if (event.target.classList.contains('cancel-button')) {
          const taskItem = event.target.closest("div.task-item-Medium, div.task-item-High, div.task-item-Low");
          if (taskItem) {
              const details = taskItem.querySelector("#toDelete");
              const taskList = document.querySelector('.task-list');
              taskList.removeChild(taskItem); // Removes task from DOM
              
              // Sends a DELETE request to remove the task from the server.
              fetch(`http://35.225.30.86:8080/api/tasks/${details.textContent}`, {
                  method: `DELETE`
              }).then(response => {
                  if (!response.ok) {
                      throw new Error('Failed to delete task');
                  }
              }).catch(error => {
                  console.error('Error:', error);
              });
          }
      }
  });
}

// Attaches change event listeners to the task status dropdowns for updating task status.
function deleteButtonListeners() {
  const taskList = document.querySelector('.task-list');
  
  taskList.addEventListener('change', (event) => {
      if (event.target.classList.contains('status-button')) {
          const taskItem = event.target.closest("div.task-item-Medium, div.task-item-High, div.task-item-Low");
          if (taskItem) {
              const taskId = taskItem.querySelector("#toDelete").textContent.trim();
              const statusValue = event.target.value; // Get selected status

              const updateData = {
                  taskID: taskId,
                  status: parseInt(statusValue), // Convert to integer for the API
              };

              // Calls updateTask function to send updated status to the server.
              updateTask(updateData);
              // Refreshes the task list by re-fetching tasks.
              getTasks(1);
          }
      }
  });
}


function displayCalendarView(tasks, year, month) {
    tasks = tasks || [];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentAbs = currentYear * 12 + currentMonth;
    const displayedAbs = year * 12 + month;
    if (displayedAbs < currentAbs - 12 || displayedAbs > currentAbs + 12) {
        return;
    }

    const calendarContainer = document.querySelector('.task-list-calendar');
    calendarContainer.innerHTML = '';

    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];

    const calendarHeader = document.createElement('h2');
    calendarHeader.textContent = `${monthNames[month]} ${year}`;
    calendarContainer.appendChild(calendarHeader);

    const navContainer = document.createElement('div');
    navContainer.classList.add('calendar-nav');

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.classList.add('date-view-button');
    prevBtn.addEventListener('click', () => {
        let newYear = displayedYear;
        let newMonth = displayedMonth - 1;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }
        let newAbs = newYear * 12 + newMonth;
        if (newAbs >= currentYear * 12 + currentMonth - 12) {
            displayedYear = newYear;
            displayedMonth = newMonth;
            displayCalendarView(window.allTasks, displayedYear, displayedMonth);
        }
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.classList.add('date-view-button');
    nextBtn.addEventListener('click', () => {
        let newYear = displayedYear;
        let newMonth = displayedMonth + 1;
        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        let newAbs = newYear * 12 + newMonth;
        if (newAbs <= currentYear * 12 + currentMonth + 12) {
            displayedYear = newYear;
            displayedMonth = newMonth;
            displayCalendarView(window.allTasks, displayedYear, displayedMonth);
        }
    });

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);
    calendarContainer.appendChild(navContainer);

    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month+1, 0).getDate();

    const table = document.createElement('table');
    table.classList.add('calendar-table');

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const headerRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const tasksByDate = {};
    tasks.forEach(task => {
        const dateKey = new Date(task.due_date).toDateString(); 
        if (!tasksByDate[dateKey]) {
            tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
    });

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if ((i === 0 && j < firstDayOfMonth) || date > daysInMonth) {
                cell.classList.add('empty-cell');
            } else {
                cell.classList.add('calendar-day');
                const cellDate = new Date(year, month, date);
                const dateLabel = document.createElement('div');
                dateLabel.classList.add('date-label');
                dateLabel.textContent = date;
                cell.appendChild(dateLabel);

                const tasksToday = tasksByDate[cellDate.toDateString()];
                if (tasksToday && tasksToday.length > 0) {
                    tasksToday.forEach(task => {
                        const taskDiv = document.createElement('div');
                        taskDiv.classList.add(`task-item-${task.priority}`, 'calendar-task-item');
                        taskDiv.textContent = task.title; 
                        cell.appendChild(taskDiv);
                    });
                }

                date++;
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
        if (date > daysInMonth) break; 
    }

    calendarContainer.appendChild(table);
}

function toggleCalendarView() {
    const listView = document.querySelector('.task-container');
    const calendarView = document.querySelector('.task-container-calendar-view');
    const reminderView = document.querySelector('.reminder-container')

    if (calendarView.classList.contains('hidden')) {
        calendarView.classList.remove('hidden');
        if (!listView.classList.contains('hidden')) {
            listView.classList.add('hidden');
        } if (!reminderView.classList.contains('hidden')) {
            reminderView.classList.add('hidden');
        }
        displayCalendarView(window.allTasks || [], displayedYear, displayedMonth);
    } else {
        calendarView.classList.add('hidden');
        if (!reminderView.classList.contains('hidden')) {
        reminderView.classList.add('hidden');
        }
        listView.classList.remove('hidden');
    }
}


function openTaskFormView() {
    const calendarView = document.querySelector('.task-container-calendar-view');
    const viewList = document.querySelector('.task-container-hidden');

    calendarView.classList.add('hidden');
    viewList.classList.remove('hidden');
}

// Calendar view JS

const addButton = document.querySelector(".add-button");
const listView = document.querySelector(".task-container");
const viewList = document.querySelector(".task-container-hidden");
viewList.classList.toggle("hidden");
addButton.addEventListener("click",()=>{
    listView.classList.toggle("hidden");
    viewList.classList.toggle("hidden");
});
const submitButton = document.querySelector("#form-submit");

submitButton.addEventListener("click",async (event)=>{
    event.preventDefault();

    const taskData = {
    user_id:1,    
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    status: parseInt(document.getElementById("status").value),
    due_date: document.getElementById("dueDate").value,
    description: document.getElementById("description").value,
};
await addTask(taskData);

document.getElementById("taskForm").reset();
await getTasks(1);
viewList.classList.add("hidden");
listView.classList.toggle("hidden");
});


// Reminders JS


const fs = require('fs');
const path = require('path');

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
 * Displays a pop-up menu for adding a new reminder.
 * It first fetches the list of tasks for a specific user from the server.
 * If the request is successful, it creates a new pop-up form for adding a reminder, with a dropdown for selecting a task, 
 * and fields for entering a reminder date and time. The task options are retrieved from the fetched tasks.
 * It then appends the pop-up to the document body and sets up event listeners:
 * - A "submit" event listener on the form triggers the addReminder function to save the reminder.
 * - A "click" event listener on the cancel button removes the pop-up from the DOM.
 * If an error occurs during the fetching of tasks or the process of displaying the form, it logs the error to the console.
 */
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


/**
 * This function handles the process of adding a new reminder. If all required fields are provided, it creates a new reminder object using the createReminder function.
 * The function then sends a POST request to the server to add the reminder.
 * it then reloads the Visual Studio Code window to repopulate the reminders list and closes the pop-up form.
 * If an error occurs during the request, it logs the error to the console.
 * @param {Event} event - The event object for the form submission, used to prevent default form behavior.
 * @param {HTMLElement} addPopUp - The pop-up element to be removed after the reminder is added.
 */
async function addReminder(event, addPopUp) {
    event.preventDefault();
    const taskId = document.querySelector("#taskSelect").value;
    const reminderDate = document.querySelector("#reminderDate").value;
    const reminderTime = document.querySelector("#reminderTime").value;
    
    if (taskId && reminderDate && reminderTime) {
      let newReminder = createReminder(taskId, reminderDate, reminderTime);
      try {
        await fetch("http://35.225.30.86:8080/api/reminders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newReminder),
        });
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      } catch (error) {
        console.log(error);
      }
      addPopUp.remove();
    }
  }


/**
 * Creates a reminder object with a formatted reminder time.
 * 
 * This function takes in a taskId, reminderDate, and reminderTime, and returns an object 
 * containing the taskId and a reminder_time, which is a formatted string in the "YYYY-MM-DD HH:MM:SS" format.
 * It combines the reminderDate and reminderTime into a datetime object.
 * 
 * @param {string} taskId - The ID of the task associated with the reminder.
 * @param {string} reminderDate - The date of the reminder in "YYYY-MM-DD" format.
 * @param {string} reminderTime - The time of the reminder in "HH:MM" format.
 * @returns {Object} An object containing the taskId and the formatted reminder time as a string.
 */
function createReminder(taskId, reminderDate, reminderTime) {
  let reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
  reminderDateTime.setHours(reminderDateTime.getHours());
  reminderDateTime = reminderDateTime.toISOString().slice(0, 19).replace("T", " ");
  return {
    taskID: taskId,
    reminder_time: reminderDateTime,
  };
}

/**
 * Deletes a reminder by its ID by making a DELETE request to the API endpoint.
 * 
 * After successfully deleting the reminder, it triggers a Visual Studio Code command to reload the window 
 * in order to refresh the list of reminders.
 * If an error occurs during the request, it logs the error to the console.
 * 
 * @param {string} reminderId - The ID of the reminder to be deleted.
 */

async function deleteReminder(reminderId) {
  try {
    await fetch(`http://35.225.30.86:8080/api/reminders/${reminderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    vscode.commands.executeCommand('workbench.action.reloadWindow');
  } catch (error) {
    console.log(error);
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

/**
 * Toggles the visibility of the reminder list in the `task-view.html` page.
 * 
 * The function checks if the class list of the reminder list element contains the string "hidden".
 * - If the "hidden" class is present, it removes it, making the reminder list visible, 
 *   and also adds the class to the other two views to hide them.
 * - If the "hidden" class is not present, it adds it to the reminder list, hiding it from view, 
 *   and un-hides the tasks.
 */
async function toggleReminderView() {
  const listView = document.querySelector('.task-container');
  const calendarView = document.querySelector('.task-container-calendar-view');
  const reminderView = document.querySelector('.reminder-container');

  if (reminderView.classList.contains('hidden')) {
    reminderView.classList.remove('hidden');
    listView.classList.add('hidden');
    calendarView.classList.add('hidden');
  } else {
      reminderView.classList.add('hidden');
      if (!calendarView.classList.contains('hidden')) {
          calendarView.classList.add('hidden');
      }
      listView.classList.remove('hidden');
  }
}