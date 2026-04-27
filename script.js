const STORAGE_KEY = "task-reminder-app";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");
const notifyButton = document.getElementById("notifyButton");
const notifyStatus = document.getElementById("notifyStatus");
const taskItemTemplate = document.getElementById("taskItemTemplate");

let tasks = loadTasks();

setDefaultDateTime();
updateNotificationStatus();
renderTasks();
checkDueTasks();

taskForm.addEventListener("submit", handleTaskSubmit);
notifyButton.addEventListener("click", requestNotificationPermission);
window.setInterval(checkDueTasks, 30000);

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function setDefaultDateTime() {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  const dueDateInput = document.getElementById("dueDate");
  const dueTimeInput = document.getElementById("dueTime");

  dueDateInput.value = formatDateInput(nextHour);
  dueDateInput.min = formatDateInput(now);
  dueTimeInput.value = formatTimeInput(nextHour);
}

function handleTaskSubmit(event) {
  event.preventDefault();

  const formData = new FormData(taskForm);
  const title = formData.get("title").trim();
  const description = formData.get("description").trim();
  const dueDate = formData.get("dueDate");
  const dueTime = formData.get("dueTime");
  const remindAt = new Date(`${dueDate}T${dueTime}`);

  if (!title || Number.isNaN(remindAt.getTime())) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    remindAt: remindAt.toISOString(),
    completed: false,
    notified: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  setDefaultDateTime();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.hidden = false;
    taskCount.textContent = "0 tugas";
    return;
  }

  emptyState.hidden = true;
  taskCount.textContent = `${tasks.length} tugas`;

  tasks
    .slice()
    .sort((a, b) => new Date(a.remindAt) - new Date(b.remindAt))
    .forEach((task) => {
      const fragment = taskItemTemplate.content.cloneNode(true);
      const card = fragment.querySelector(".task-card");
      const title = fragment.querySelector(".task-title");
      const description = fragment.querySelector(".task-description");
      const meta = fragment.querySelector(".task-meta");
      const badge = fragment.querySelector(".task-badge");
      const completeButton = fragment.querySelector(".complete-button");
      const deleteButton = fragment.querySelector(".delete-button");

      const remindDate = new Date(task.remindAt);
      const isOverdue = remindDate < new Date() && !task.completed;

      if (task.completed) {
        card.classList.add("completed");
      }

      title.textContent = task.title;
      description.textContent = task.description || "Tanpa deskripsi tambahan.";
      meta.textContent = `Pengingat: ${formatReminder(remindDate)}`;
      badge.textContent = task.completed ? "Selesai" : isOverdue ? "Terlewat" : "Aktif";

      completeButton.textContent = task.completed ? "Aktifkan Lagi" : "Selesai";
      completeButton.addEventListener("click", () => toggleTask(task.id));
      deleteButton.addEventListener("click", () => deleteTask(task.id));

      taskList.appendChild(fragment);
    });
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, completed: !task.completed, notified: task.completed ? task.notified : true }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function formatReminder(date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function updateNotificationStatus() {
  if (!("Notification" in window)) {
    notifyStatus.textContent = "Browser tidak mendukung notifikasi";
    notifyButton.disabled = true;
    return;
  }

  if (Notification.permission === "granted") {
    notifyStatus.textContent = "Notifikasi aktif";
    return;
  }

  if (Notification.permission === "denied") {
    notifyStatus.textContent = "Izin notifikasi ditolak";
    return;
  }

  notifyStatus.textContent = "Notifikasi belum aktif";
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();
  updateNotificationStatus();

  if (permission === "granted") {
    checkDueTasks();
  }
}

function checkDueTasks() {
  const now = new Date();
  let changed = false;

  tasks = tasks.map((task) => {
    const remindDate = new Date(task.remindAt);
    const shouldNotify = !task.completed && !task.notified && remindDate <= now;

    if (shouldNotify) {
      changed = true;
      showNotification(task);
      return { ...task, notified: true };
    }

    return task;
  });

  if (changed) {
    saveTasks();
    renderTasks();
  }
}

function showNotification(task) {
  if ("Notification" in window && Notification.permission === "granted") {
    const body = task.description || "Waktunya mengerjakan tugas ini.";
    new Notification(task.title, { body });
  } else {
    window.alert(`Pengingat tugas: ${task.title}`);
  }
}
