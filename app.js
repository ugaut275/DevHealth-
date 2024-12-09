const vscode = acquireVsCodeApi();
let displayedYear = new Date().getFullYear();
let displayedMonth = new Date().getMonth();

async function getTasks(taskId){
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

async function updateTask(updateData){
try{
    const response = await fetch(`http://35.225.30.86:8080/api/tasks/${updateData.taskID}`,{
        method: `PUT`,
        headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
    });
}
catch(error){
    ;
}

}
function displayTasks(tasks) {
    const taskList = document.querySelector('.task-list');
    taskList.innerHTML = ''; 

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
                             <p > ${task.description} </p>
            <select class="status-button ${task.status === 1 ? 'Not-Started' : task.status === 2 ? 'In-Progress' : task.status === 3 ? 'Completed' : ''}" value="${task.status}">
                <option value="1" ${task.status === 1 ? 'selected' : ''}>Not Started</option>
                <option value="2" ${task.status === 2 ? 'selected' : ''}>In Progress</option>
                <option value="3" ${task.status === 3 ? 'selected' : ''}>Completed</option>
            </select>                        
    
    </div>
               
            
        `;
        taskList.appendChild(taskItem);
        
    });

    attachCancelButtonListeners();
    deleteButtonListeners(); 
}

function attachCancelButtonListeners() {
    
    const taskList = document.querySelector('.task-list');
    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancel-button')) {
            const taskItem = event.target.closest("div.task-item-Medium, div.task-item-High, div.task-item-Low");
            if (taskItem) {
                const details = taskItem.querySelector("#toDelete");
                const taskList = document.querySelector('.task-list');
                taskList.removeChild(taskItem);
                fetch(`http://35.225.30.86:8080/api/tasks/${details.textContent}`,{
                    method: `DELETE`
                }).then(response => {
                if (response.ok) {
                    ;
                } else {
                    throw new Error('Failed to delete task');
                }
                 })
                .catch(error => {
                    console.error('Error:', error);
                });
}
            
        }
    });
}

function deleteButtonListeners() {
const taskList = document.querySelector('.task-list');

taskList.addEventListener('change', (event) => {
if (event.target.classList.contains('status-button')) {
    const taskItem = event.target.closest("div.task-item-Medium, div.task-item-High, div.task-item-Low");
    if (taskItem) {
        const taskId = taskItem.querySelector("#toDelete").textContent.trim();
        const statusValue = event.target.value; 

        const updateData = {
            taskID: taskId,
            status: parseInt(statusValue), 
        };

        updateTask(updateData);
        
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