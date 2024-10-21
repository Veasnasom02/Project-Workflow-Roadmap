let tasks = [];
let projectStartDate = null;
let projectEndDate = null;

function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('workflowTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            if (task.startDate) task.startDate = new Date(task.startDate);
            if (task.endDate) task.endDate = new Date(task.endDate);
        });
    }

    projectStartDate = localStorage.getItem('projectStartDate');
    if (projectStartDate) {
        projectStartDate = new Date(projectStartDate);
        document.getElementById('start-date').value = projectStartDate.toISOString().split('T')[0];
    }

    projectEndDate = localStorage.getItem('projectEndDate');
    if (projectEndDate) {
        projectEndDate = new Date(projectEndDate);
        document.getElementById('end-date').value = projectEndDate.toISOString().split('T')[0];
    }

    const projectTitle = localStorage.getItem('projectTitle');
    if (projectTitle) {
        document.getElementById('project-title').textContent = projectTitle;
    }

    const projectDescription = localStorage.getItem('projectDescription');
    if (projectDescription) {
        document.getElementById('project-description').textContent = projectDescription;
    }
}

function saveToLocalStorage() {
    localStorage.setItem('workflowTasks', JSON.stringify(tasks));
    if (projectStartDate) localStorage.setItem('projectStartDate', projectStartDate.toISOString());
    if (projectEndDate) localStorage.setItem('projectEndDate', projectEndDate.toISOString());
    localStorage.setItem('projectTitle', document.getElementById('project-title').textContent);
    localStorage.setItem('projectDescription', document.getElementById('project-description').textContent);
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        container.appendChild(taskElement);
    });
    updateProgress();
    animateTasks();
    saveToLocalStorage();
}

function createTaskElement(task, index) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.innerHTML = `
        <div class="task-header ${task.group ? 'group-header' : ''}">
            <div class="task-number">${index + 1}</div>
            <div class="task-content">
                <div class="checkbox-container">
                    <input type="checkbox" id="checkbox-${index}" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${index})">
                    <label for="checkbox-${index}" class="task-title">${task.title}</label>
                </div>
                <div class="task-description">${task.description}</div>
                <div class="task-dates">
                    <span>Start: ${task.startDate ? task.startDate.toLocaleDateString() : 'Not set'}</span>
                    <span>End: ${task.endDate ? task.endDate.toLocaleDateString() : 'Not set'}</span>
                </div>
                <div class="edit-buttons">
                    <button class="edit-button" onclick="editTask(${index})">Edit</button>
                    <button class="delete-button" onclick="deleteTask(${index})">Delete</button>
                    ${task.group ? `<button class="add-subtask-button" onclick="addSubtask(${index})">Add Subtask</button>` : ''}
                    ${!task.group ? `<button class="make-group-button" onclick="makeGroup(${index})">Make Group</button>` : ''}
                </div>
                <div class="edit-form">
                    <input type="text" class="edit-title" value="${task.title}">
                    <textarea class="edit-description">${task.description}</textarea>
                    <input type="date" class="edit-start-date" value="${task.startDate ? task.startDate.toISOString().split('T')[0] : ''}">
                    <input type="date" class="edit-end-date" value="${task.endDate ? task.endDate.toISOString().split('T')[0] : ''}">
                    <button onclick="saveEdit(${index})">Save</button>
                </div>
            </div>
        </div>
    `;

    if (task.group && task.subtasks) {
        const subtasksContainer = document.createElement('div');
        subtasksContainer.className = 'subtasks-container';
        task.subtasks.forEach((subtask, subtaskIndex) => {
            const subtaskElement = createSubtaskElement(subtask, index, subtaskIndex);
            subtasksContainer.appendChild(subtaskElement);
        });
        taskElement.appendChild(subtasksContainer);
    }

    return taskElement;
}

function createSubtaskElement(subtask, taskIndex, subtaskIndex) {
    const subtaskElement = document.createElement('div');
    subtaskElement.className = 'subtask';
    subtaskElement.innerHTML = `
        <div class="task-content">
            <div class="checkbox-container">
                <input type="checkbox" id="checkbox-${taskIndex}-${subtaskIndex}" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtaskComplete(${taskIndex}, ${subtaskIndex})">
                <label for="checkbox-${taskIndex}-${subtaskIndex}" class="subtask-title">${subtask.title}</label>
            </div>
            <div class="subtask-description">${subtask.description}</div>
            <div class="edit-buttons">
                <button class="edit-button" onclick="editSubtask(${taskIndex}, ${subtaskIndex})">Edit</button>
                <button class="delete-button" onclick="deleteSubtask(${taskIndex}, ${subtaskIndex})">Delete</button>
            </div>
            <div class="edit-form">
                <input type="text" class="edit-title" value="${subtask.title}">
                <textarea class="edit-description">${subtask.description}</textarea>
                <button onclick="saveSubtaskEdit(${taskIndex}, ${subtaskIndex})">Save</button>
            </div>
        </div>
    `;
    return subtaskElement;
}

function editTask(index) {
    const task = document.querySelectorAll('.task')[index];
    const form = task.querySelector('.edit-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveEdit(index) {
    const task = document.querySelectorAll('.task')[index];
    const title = task.querySelector('.edit-title').value;
    const description = task.querySelector('.edit-description').value;
    const startDate = task.querySelector('.edit-start-date').value;
    const endDate = task.querySelector('.edit-end-date').value;
    tasks[index] = { 
        ...tasks[index],
        title, 
        description, 
        startDate: startDate ? new Date(startDate) : null, 
        endDate: endDate ? new Date(endDate) : null 
    };
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function addTask() {
    tasks.push({ title: "New Task", description: "Description for the new task", completed: false, startDate: null, endDate: null, group: false });
    renderTasks();
}

function makeGroup(index) {
    tasks[index].group = true;
    tasks[index].subtasks = [];
    renderTasks();
}

function addSubtask(index) {
    if (!tasks[index].subtasks) {
        tasks[index].subtasks = [];
    }
    tasks[index].subtasks.push({ title: "New Subtask", description: "Description for the new subtask", completed: false });
    renderTasks();
}

function editSubtask(taskIndex, subtaskIndex) {
    const task = document.querySelectorAll('.task')[taskIndex];
    const subtask = task.querySelectorAll('.subtask')[subtaskIndex];
    const form = subtask.querySelector('.edit-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveSubtaskEdit(taskIndex, subtaskIndex) {
    const task = document.querySelectorAll('.task')[taskIndex];
    const subtask = task.querySelectorAll('.subtask')[subtaskIndex];
    const title = subtask.querySelector('.edit-title').value;
    const description = subtask.querySelector('.edit-description').value;
    tasks[taskIndex].subtasks[subtaskIndex] = { 
        ...tasks[taskIndex].subtasks[subtaskIndex],
        title, 
        description
    };
    renderTasks();
}

function deleteSubtask(taskIndex, subtaskIndex) {
    tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
    renderTasks();
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    updateProgress();
    saveToLocalStorage();
}

function toggleSubtaskComplete(taskIndex, subtaskIndex) {
    tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
    updateProgress();
    saveToLocalStorage();
}

function updateProgress() {
    const totalTasks = tasks.reduce((total, task) => {
        return total + 1 + (task.subtasks ? task.subtasks.length : 0);
    }, 0);
    
    const completedTasks = tasks.reduce((total, task) => {
        return total + (task.completed ? 1 : 0) + (task.subtasks ? task.subtasks.filter(subtask => subtask.completed).length : 0);
    }, 0);
    
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const progress = document.querySelector('.progress');
    progress.style.width = `${progressPercentage}%`;
    
    const progressText = document.querySelector('.progress-percentage');
    progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
    
    updateStepMarkers();
    updateProgressLabels();
    updateCountdown(progressPercentage);
}

function updateStepMarkers() {
    const stepMarkers = document.querySelector('.step-markers');
    stepMarkers.innerHTML = '';
    
    const totalTasks = tasks.reduce((total, task) => {
        return total + 1 + (task.subtasks ? task.subtasks.length : 0);
    }, 0);
    
    let completedTasks = 0;
    tasks.forEach((task, taskIndex) => {
        const marker = document.createElement('div');
        marker.className = `step-marker ${task.completed ? 'completed' : ''}`;
        marker.style.left = `${(completedTasks / (totalTasks - 1)) * 100}%`;
        stepMarkers.appendChild(marker);
        completedTasks++;

        if (task.subtasks) {
            task.subtasks.forEach((subtask, subtaskIndex) => {
                const subtaskMarker = document.createElement('div');
                subtaskMarker.className = `step-marker subtask-marker ${subtask.completed ? 'completed' : ''}`;
                subtaskMarker.style.left = `${(completedTasks / (totalTasks - 1)) * 100}%`;
                stepMarkers.appendChild(subtaskMarker);
                completedTasks++;
            });
        }
    });
}

function updateProgressLabels() {
    const progressLabels = document.querySelector('.progress-labels');
    progressLabels.innerHTML = '';
    
    const totalTasks = tasks.reduce((total, task) => {
        return total + 1 + (task.subtasks ? task.subtasks.length : 0);
    }, 0);
    
    let currentTask = 0;
    tasks.forEach((task, taskIndex) => {
        const label = document.createElement('span');
        label.textContent = `Task ${taskIndex + 1}`;
        label.style.left = `${(currentTask / (totalTasks - 1)) * 100}%`;
        label.style.transform = 'translateX(-50%)';
        progressLabels.appendChild(label);
        currentTask++;

        if (task.subtasks) {
            task.subtasks.forEach((subtask, subtaskIndex) => {
                const subtaskLabel = document.createElement('span');
                subtaskLabel.textContent = `Subtask ${subtaskIndex + 1}`;
                subtaskLabel.style.left = `${(currentTask / (totalTasks - 1)) * 100}%`;
                subtaskLabel.style.transform = 'translateX(-50%)';
                progressLabels.appendChild(subtaskLabel);
                currentTask++;
            });
        }
    });
}

function updateProjectDates() {
    projectStartDate = new Date(document.getElementById('start-date').value);
    projectEndDate = new Date(document.getElementById('end-date').value);
    updateProgress();
    saveToLocalStorage();
}

function updateCountdown(progressPercentage) {
    const countdownDaysElement = document.getElementById('countdown-days');
    const countdownPercentageElement = document.getElementById('countdown-percentage');
    if (projectStartDate && projectEndDate) {
        const now = new Date();
        const totalDuration = projectEndDate - projectStartDate;
        const remainingTime = projectEndDate - now;
        
        if (remainingTime > 0) {
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            countdownDaysElement.textContent = `${days} days remaining`;
            countdownPercentageElement.textContent = `${Math.round(progressPercentage)}% of project complete`;
        } else {
            countdownDaysElement.textContent = "Project deadline has passed";
            countdownPercentageElement.textContent = "100% of project complete";
        }
    } else {
        countdownDaysElement.textContent = "-- days remaining";
        countdownPercentageElement.textContent = "Set start and end dates";
    }
}

function animateTasks() {
    gsap.to('.task', {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "power2.out",
        duration: 0.5
    });
}

function printRoadmap() {
    window.print();
}

function resetWorkflow() {
    if (confirm("Are you sure you want to reset the workflow? This will delete all tasks and reset the project details.")) {
        // Clear tasks
        tasks = [];

        // Reset project dates
        projectStartDate = null;
        projectEndDate = null;
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';

        // Reset project title and description
        document.getElementById('project-title').textContent = 'Project Workflow Roadmap';
        document.getElementById('project-description').textContent = 'Click to add project description...';

        // Clear local storage
        localStorage.clear();

        // Re-render the tasks (which will now be empty)
        renderTasks();

        // Update the progress and countdown
        updateProgress();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderTasks();
    document.getElementById('start-date').addEventListener('change', updateProjectDates);
    document.getElementById('end-date').addEventListener('change', updateProjectDates);
    document.getElementById('project-title').addEventListener('blur', saveToLocalStorage);
    document.getElementById('project-description').addEventListener('blur', saveToLocalStorage);
    setInterval(updateProgress, 1000 * 60 * 60); // Update progress every hour
});
