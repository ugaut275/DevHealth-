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


/**
 * Renders a calendar view for a specific month and year, displaying tasks
 * on their due dates. Includes navigation buttons for browsing months
 * within a one-year range from the current date.
 */
function displayCalendarView(tasks, year, month) {
  // Initialize tasks as an empty array if no tasks are provided
  tasks = tasks || [];

  // Get the current date to calculate limits for navigation
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calculate absolute month values for range comparisons
  const currentAbs = currentYear * 12 + currentMonth;
  const displayedAbs = year * 12 + month;

  // Prevent navigation outside the range of 1 year before/after the current month
  if (displayedAbs < currentAbs - 12 || displayedAbs > currentAbs + 12) {
      return;
  }

  // Select the container for the calendar and clear its content
  const calendarContainer = document.querySelector('.task-list-calendar');
  calendarContainer.innerHTML = '';

  // Array of month names for easy header display
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  // Add a header showing the current month and year
  const calendarHeader = document.createElement('h2');
  calendarHeader.textContent = `${monthNames[month]} ${year}`;
  calendarContainer.appendChild(calendarHeader);

  // Create navigation buttons for "Previous" and "Next" months
  const navContainer = document.createElement('div');
  navContainer.classList.add('calendar-nav');

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.classList.add('date-view-button');
  prevBtn.addEventListener('click', () => {
      // Navigate to the previous month
      let newYear = displayedYear;
      let newMonth = displayedMonth - 1;
      if (newMonth < 0) { // Wrap around to December of the previous year
          newMonth = 11;
          newYear -= 1;
      }
      const newAbs = newYear * 12 + newMonth;
      // Only navigate if within the allowed range
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
      // Navigate to the next month
      let newYear = displayedYear;
      let newMonth = displayedMonth + 1;
      if (newMonth > 11) { // Wrap around to January of the next year
          newMonth = 0;
          newYear += 1;
      }
      const newAbs = newYear * 12 + newMonth;
      // Only navigate if within the allowed range
      if (newAbs <= currentYear * 12 + currentMonth + 12) {
          displayedYear = newYear;
          displayedMonth = newMonth;
          displayCalendarView(window.allTasks, displayedYear, displayedMonth);
      }
  });

  navContainer.appendChild(prevBtn);
  navContainer.appendChild(nextBtn);
  calendarContainer.appendChild(navContainer);

  // Calculate the first day of the month and total days in the month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of the week the month starts on
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the month

  // Create a table to represent the calendar grid
  const table = document.createElement('table');
  table.classList.add('calendar-table');

  // Add a header row for the days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const headerRow = document.createElement('tr');
  daysOfWeek.forEach(day => {
      const th = document.createElement('th');
      th.textContent = day;
      headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Group tasks by their due date for easy lookup
  const tasksByDate = {};
  tasks.forEach(task => {
      const dateKey = new Date(task.due_date).toDateString();
      if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
  });

  // Populate the calendar with days and tasks
  let date = 1;
  for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 7; j++) { // Each row has 7 columns (days of the week)
          const cell = document.createElement('td');
          if ((i === 0 && j < firstDayOfMonth) || date > daysInMonth) {
              // Empty cells for days outside the current month
              cell.classList.add('empty-cell');
          } else {
              // Display valid dates
              cell.classList.add('calendar-day');
              const cellDate = new Date(year, month, date);

              // Add the date label
              const dateLabel = document.createElement('div');
              dateLabel.classList.add('date-label');
              dateLabel.textContent = date;
              cell.appendChild(dateLabel);

              // Display tasks due on this date
              const tasksToday = tasksByDate[cellDate.toDateString()];
              if (tasksToday && tasksToday.length > 0) {
                  tasksToday.forEach(task => {
                      const taskDiv = document.createElement('div');
                      taskDiv.classList.add(`task-item-${task.priority}`, 'calendar-task-item');
                      taskDiv.textContent = task.title; // Show task title
                      cell.appendChild(taskDiv);
                  });
              }

              date++; // Move to the next date
          }
          row.appendChild(cell);
      }
      table.appendChild(row);
      if (date > daysInMonth) break; // Stop creating rows when the month ends
  }

  calendarContainer.appendChild(table); // Add the complete calendar table to the container
}

/**
 * Toggles visibility between the calendar view and the task list view.
 */
function toggleCalendarView() {
  const listView = document.querySelector('.task-container'); // Task list container
  const calendarView = document.querySelector('.task-container-calendar-view'); // Calendar view container
  const reminderView = document.querySelector('.reminder-container'); // Reminder view container

  if (calendarView.classList.contains('hidden')) {
      calendarView.classList.remove('hidden'); // Show calendar view
      listView.classList.add('hidden'); // Hide task list view
      reminderView.classList.add('hidden'); // Hide reminder view
      displayCalendarView(window.allTasks || [], displayedYear, displayedMonth);
  } else {
      calendarView.classList.add('hidden'); // Hide calendar view
      listView.classList.remove('hidden'); // Show task list view
      reminderView.classList.add('hidden'); // Ensure reminder view is hidden
  }
}

/**
 * Switches from the calendar view to the task form view.
 */
function openTaskFormView() {
  const calendarView = document.querySelector('.task-container-calendar-view'); // Calendar view container
  const viewList = document.querySelector('.task-container-hidden'); // Task form container

  calendarView.classList.add('hidden'); // Hide calendar view
  viewList.classList.remove('hidden'); // Show task form
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
        // TODO: update HTML
      } catch (error) {
        console.log(error);
      }
      addPopUp.remove();
    }
  }

function createReminder(taskId, reminderDate, reminderTime) {
  let reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
  reminderDateTime.setHours(reminderDateTime.getHours()); // i wish i knew why the db is adding 5 hours to anything i add, but because i dont, this will have to do.
  reminderDateTime = reminderDateTime.toISOString().slice(0, 19).replace("T", " ");
  return {
    taskID: taskId,
    reminder_time: reminderDateTime,
  };
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

async function showReminders(){
  let remindersData = await reminders.getReminders();
  let reminderHTML = await reminders.generateReminderHTML(remindersData);
  let reminderContainer = document.querySelector(".reminder-container");
  let reminders = document.createElement("div");
  reminders.htmlContent = reminderHTML;
  reminderContainer.appendChild(reminders);
}