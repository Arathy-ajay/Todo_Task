window.onload = function() {
    console.log("initializing  page")
    showAllTasks();
    updateClock();
};

function updateClock() {
    const timeElement = document.getElementById("current-time");
    setInterval(() => {
        const now = new Date();
        timeElement.textContent = `Current Time: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }, 1000);
}

function addTask() {
    const taskName = document.getElementById("taskName").value;
    const taskDateTime = document.getElementById("taskDateTime").value;
    const taskCategory = document.getElementById("taskCategory").value;

    if (!taskName || !taskDateTime || !taskCategory) {
        alert("Please fill in all fields!");
        return;
    }

    const tasks = getTasks();
    const newTask = {
        id: Date.now(),
        name: taskName,
        datetime: taskDateTime,
        category: taskCategory
    };

    tasks.push(newTask);
    saveTasks(tasks);

    document.getElementById("taskName").value = '';
    document.getElementById("taskDateTime").value = '';
    document.getElementById("taskCategory").value = '';
    showAllTasks();
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showAllTasks() {
    updateMenuActive('all');
    displayTasks(getTasks());
}

function filterByCategory(category) {
    updateMenuActive(category);
    const tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.category === category);
    displayTasks(filteredTasks);
}
function filterTasksByDate() {
    const selectedDate = document.getElementById("dateFilter").value;
    const tasks = getTasks();

    if (selectedDate) {
        const filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.datetime).toISOString().split('T')[0];
            return taskDate === selectedDate;
        });
        displayTasks(filteredTasks);
    } else {
        showAllTasks();
    }
}

function resetDateFilter() {
    document.getElementById("dateFilter").value = "";
    showAllTasks();
}
function updateMenuActive(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if ((category === 'all' && item.textContent === 'All Tasks') ||
            item.textContent.toLowerCase() === category) {
            item.classList.add('active');
        }
    });
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}
function groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
        const { date } = formatDate(task.datetime);
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(task);
    });
    return grouped;
}
function displayTasks(tasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="no-tasks">No tasks available</p>';
        return;
    }

    const groupedTasks = groupTasksByDate(tasks);
    const dates = Object.keys(groupedTasks).sort((a, b) => new Date(b) - new Date(a));

    dates.forEach(date => {
        const dateSection = document.createElement('div');
        dateSection.className = 'date-section';

        const dateHeader = document.createElement('h3');
        dateHeader.className = 'date-header';
        dateHeader.textContent = `Date: ${date}`;
        dateSection.appendChild(dateHeader);

        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'date-tasks';

        groupedTasks[date].forEach(task => {
            const { time } = formatDate(task.datetime);
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.category}`;
            taskElement.innerHTML = `
                <div class="task-content">
                    <div class="task-category-label ${task.category}">
                        ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </div>
                    <p>
                        <strong>${task.name}</strong>
                        <span class="task-time">Time: ${time}</span>
                    </p>
                </div>
                <div class="task-actions">
                <input type="checkbox" class="complete-checkbox" ${task.completed ? "checked" : ""} onclick="toggleTaskCompletion(${task.id})">
                <button class="edit-icon" onclick="editTask(${task.id})">✎</button>
                <button class="delete-icon" onclick="deleteTask(${task.id})">❌</button>
                </div>
            `;
            tasksContainer.appendChild(taskElement);
        });

        dateSection.appendChild(tasksContainer);
        taskList.appendChild(dateSection);
    });
}
function toggleTaskCompletion(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        showAllTasks();
    }
}
function deleteTask(taskId) {
    const tasks = getTasks().filter(task => task.id !== taskId);
    saveTasks(tasks);
    showAllTasks();
}
function editTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        document.getElementById("taskName").value = task.name;
        document.getElementById("taskDateTime").value = task.datetime;
        document.getElementById("taskCategory").value = task.category;

        deleteTask(taskId); 
    }
}
function updateProfilePic() {
    const fileInput = document.getElementById("uploadPic");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profilePic").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
