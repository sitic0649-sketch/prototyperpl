// Mengambil elemen HTML
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const subject = document.getElementById("subject");
const description = document.getElementById("description");
const deadline = document.getElementById("deadline");
const priority = document.getElementById("priority");
const taskId = document.getElementById("taskId");

const taskList = document.getElementById("taskList");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const doneTasks = document.getElementById("doneTasks");

const searchInput = document.getElementById("searchInput");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

// Mengambil data tugas dari localStorage
let tasks = JSON.parse(
    localStorage.getItem("taskMateData") || "[]"
);

let currentFilter = "all";

// Menyimpan data tugas
function saveTasks() {
    localStorage.setItem(
        "taskMateData",
        JSON.stringify(tasks)
    );
}

// Mengamankan teks yang ditampilkan
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// Mengatur tanggal agar lebih mudah dibaca
function formatDate(date) {
    if (!date) return "-";

    const parts = date.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Menampilkan ringkasan tugas
function updateSummary() {
    totalTasks.textContent = tasks.length;

    pendingTasks.textContent =
        tasks.filter(task => !task.done).length;

    doneTasks.textContent =
        tasks.filter(task => task.done).length;
}

// Menampilkan daftar tugas
function displayTasks() {
    const keyword = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.done) ||
            (currentFilter === "done" && task.done);

        const matchesSearch =
            task.name.toLowerCase().includes(keyword) ||
            task.subject.toLowerCase().includes(keyword);

        return matchesFilter && matchesSearch;
    });

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<p class="empty-message">Belum ada tugas yang ditemukan.</p>';
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        item.innerHTML = `
            <div class="task-top">
                <div>
                    <h3>${escapeHTML(task.name)}</h3>
                    <p>Mata Kuliah: ${escapeHTML(task.subject)}</p>
                </div>

                <span class="status ${task.done ? "done" : "pending"}">
                    ${task.done ? "Selesai" : "Belum Selesai"}
                </span>
            </div>

            <p>Deskripsi: ${escapeHTML(task.description || "-")}</p>
            <p>Tenggat: ${formatDate(task.deadline)}</p>
            <p class="priority">
                Prioritas: ${escapeHTML(task.priority)}
            </p>

            <div class="task-actions">
                <button class="complete-btn" data-action="toggle"
                    data-id="${task.id}">
                    ${task.done ? "Batalkan Selesai" : "Tandai Selesai"}
                </button>

                <button class="edit-btn" data-action="edit"
                    data-id="${task.id}">
                    Edit
                </button>

                <button class="delete-btn" data-action="delete"
                    data-id="${task.id}">
                    Hapus
                </button>
            </div>
        `;

        taskList.appendChild(item);
    });

    updateSummary();
}

// Mengosongkan formulir
function resetForm() {
    taskForm.reset();
    taskId.value = "";
    formTitle.textContent = "Tambah Tugas Baru";
    saveButton.textContent = "Simpan Tugas";
}

// Menambahkan atau mengedit tugas
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = taskId.value;

    const taskData = {
        id: id ? Number(id) : Date.now(),
        name: taskName.value.trim(),
        subject: subject.value.trim(),
        description: description.value.trim(),
        deadline: deadline.value,
        priority: priority.value,
        done: id
            ? tasks.find(task => task.id === Number(id)).done
            : false
    };

    if (!taskData.name || !taskData.subject || !taskData.deadline) {
        alert("Silakan lengkapi data tugas!");
        return;
    }

    if (id) {
        tasks = tasks.map(task =>
            task.id === Number(id) ? taskData : task
        );

        alert("Tugas berhasil diperbarui!");
    } else {
        tasks.push(taskData);
        alert("Tugas berhasil ditambahkan!");
    }

    saveTasks();
    resetForm();
    displayTasks();
});

// Menangani tombol Edit, Hapus, dan Status
taskList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    if (action === "edit") {
        taskId.value = task.id;
        taskName.value = task.name;
        subject.value = task.subject;
        description.value = task.description;
        deadline.value = task.deadline;
        priority.value = task.priority;

        formTitle.textContent = "Edit Informasi Tugas";
        saveButton.textContent = "Simpan Perubahan";

        document.getElementById("formSection").scrollIntoView({
            behavior: "smooth"
        });
    }

    if (action === "delete") {
        const confirmDelete = confirm(
            "Apakah kamu yakin ingin menghapus tugas ini?"
        );

        if (confirmDelete) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            displayTasks();
            resetForm();
        }
    }

    if (action === "toggle") {
        task.done = !task.done;
        saveTasks();
        displayTasks();
    }
});

// Mengatur pencarian
searchInput.addEventListener("input", displayTasks);

// Mengatur tombol filter
document.querySelectorAll(".filter, .menu").forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = this.dataset.filter;

        document.querySelectorAll(".filter, .menu")
            .forEach(item => item.classList.remove("active"));

        this.classList.add("active");

        displayTasks();
    });
});

// Membatalkan proses edit atau mengosongkan formulir
cancelButton.addEventListener("click", resetForm);

// Menampilkan data ketika halaman dibuka
displayTasks();