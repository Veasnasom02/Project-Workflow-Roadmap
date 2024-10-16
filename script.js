let steps = [];
let projectStartDate = null;
let projectEndDate = null;

function loadFromLocalStorage() {
    const savedSteps = localStorage.getItem('workflowSteps');
    if (savedSteps) {
        steps = JSON.parse(savedSteps);
        steps.forEach(step => {
            if (step.startDate) step.startDate = new Date(step.startDate);
            if (step.endDate) step.endDate = new Date(step.endDate);
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
}

function saveToLocalStorage() {
    localStorage.setItem('workflowSteps', JSON.stringify(steps));
    if (projectStartDate) localStorage.setItem('projectStartDate', projectStartDate.toISOString());
    if (projectEndDate) localStorage.setItem('projectEndDate', projectEndDate.toISOString());
}

function renderSteps() {
    const container = document.getElementById('steps-container');
    container.innerHTML = '';
    steps.forEach((step, index) => {
        const stepElement = createStepElement(step, index);
        container.appendChild(stepElement);
    });
    updateProgress();
    animateSteps();
    saveToLocalStorage();
}

function createStepElement(step, index) {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.innerHTML = `
        <div class="step-number">${index + 1}</div>
        <div class="step-content">
            <div class="checkbox-container">
                <input type="checkbox" id="checkbox-${index}" ${step.completed ? 'checked' : ''} onchange="toggleComplete(${index})">
                <label for="checkbox-${index}" class="step-title">${step.title}</label>
            </div>
            <div class="step-description">${step.description}</div>
            <div class="step-dates">
                <span>Start: ${step.startDate ? step.startDate.toLocaleDateString() : 'Not set'}</span>
                <span>End: ${step.endDate ? step.endDate.toLocaleDateString() : 'Not set'}</span>
            </div>
            <div class="edit-buttons">
                <button class="edit-button" onclick="editStep(${index})">Edit</button>
                <button class="delete-button" onclick="deleteStep(${index})">Delete</button>
            </div>
            <div class="edit-form">
                <input type="text" class="edit-title" value="${step.title}">
                <textarea class="edit-description">${step.description}</textarea>
                <input type="date" class="edit-start-date" value="${step.startDate ? step.startDate.toISOString().split('T')[0] : ''}">
                <input type="date" class="edit-end-date" value="${step.endDate ? step.endDate.toISOString().split('T')[0] : ''}">
                <button onclick="saveEdit(${index})">Save</button>
            </div>
        </div>
    `;
    return stepElement;
}

function editStep(index) {
    const step = document.querySelectorAll('.step')[index];
    const form = step.querySelector('.edit-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveEdit(index) {
    const step = document.querySelectorAll('.step')[index];
    const title = step.querySelector('.edit-title').value;
    const description = step.querySelector('.edit-description').value;
    const startDate = step.querySelector('.edit-start-date').value;
    const endDate = step.querySelector('.edit-end-date').value;
    steps[index] = { 
        ...steps[index], 
        title, 
        description, 
        startDate: startDate ? new Date(startDate) : null, 
        endDate: endDate ? new Date(endDate) : null 
    };
    renderSteps();
}

function deleteStep(index) {
    steps.splice(index, 1);
    renderSteps();
}

function addStep() {
    steps.push({ title: "New Step", description: "Description for the new step", completed: false, startDate: null, endDate: null });
    renderSteps();
}

function toggleComplete(index) {
    steps[index].completed = !steps[index].completed;
    updateProgress();
    saveToLocalStorage();
}

function updateProgress() {
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;
    
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
    
    steps.forEach((step, index) => {
        const marker = document.createElement('div');
        marker.className = `step-marker ${step.completed ? 'completed' : ''}`;
        marker.style.left = `${(index / (steps.length - 1)) * 100}%`;
        stepMarkers.appendChild(marker);
    });
}

function updateProgressLabels() {
    const progressLabels = document.querySelector('.progress-labels');
    progressLabels.innerHTML = '';
    
    steps.forEach((step, index) => {
        const label = document.createElement('span');
        label.textContent = `Step ${index + 1}`;
        label.style.width = `${100 / steps.length}%`;
        label.style.textAlign = 'center';
        progressLabels.appendChild(label);
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

function animateSteps() {
    gsap.to('.step', {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        ease: "power2.out",
        duration: 0.5
    });
}

function printRoadmap() {
    window.print();
}

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderSteps();
    document.getElementById('start-date').addEventListener('change', updateProjectDates);
    document.getElementById('end-date').addEventListener('change', updateProjectDates);
    document.querySelector('.add-button').addEventListener('click', addStep);
    document.querySelector('.print-button').addEventListener('click', printRoadmap);
    setInterval(updateProgress, 1000 * 60 * 60); // Update progress every hour
});
