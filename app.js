const STORAGE_KEY = "cursor-todo-items";
const THEME_KEY = "cursor-todo-theme";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const state = {
  todos: loadTodos(),
  filter: "all",
};

const elements = {
  form: document.getElementById("todoForm"),
  input: document.getElementById("todoInput"),
  list: document.getElementById("todoList"),
  filter: document.getElementById("filterSelect"),
  remaining: document.getElementById("remainingCount"),
  clearCompleted: document.getElementById("clearCompleted"),
  themeToggle: document.getElementById("themeToggle"),
};

function render() {
  const { todos, filter } = state;
  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  elements.list.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.style.padding = "4px 8px 10px";
    empty.textContent = "No tasks yet. Add one above.";
    elements.list.appendChild(empty);
  } else {
    for (const todo of filtered) {
      const li = document.createElement("li");
      li.className = `todo-item${todo.completed ? " completed" : ""}`;
      li.dataset.id = todo.id;

      const main = document.createElement("div");
      main.className = "todo-item-main";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const label = document.createElement("span");
      label.className = "todo-label";
      label.textContent = todo.text;

      main.appendChild(checkbox);
      main.appendChild(label);

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const deleteButton = document.createElement("button");
      deleteButton.className = "button ghost small danger";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteTodo(todo.id));

      actions.appendChild(deleteButton);

      li.appendChild(main);
      li.appendChild(actions);

      elements.list.appendChild(li);
    }
  }

  const remainingCount = todos.filter((t) => !t.completed).length;
  elements.remaining.textContent =
    remainingCount === 0
      ? "All caught up"
      : `${remainingCount} task(s) remaining`;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  state.todos.unshift({
    id: createId(),
    text: trimmed,
    completed: false,
  });
  saveTodos(state.todos);
  render();
}

function toggleTodo(id) {
  state.todos = state.todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos(state.todos);
  render();
}

function deleteTodo(id) {
  state.todos = state.todos.filter((todo) => todo.id !== id);
  saveTodos(state.todos);
  render();
}

function clearCompleted() {
  const hasCompleted = state.todos.some((t) => t.completed);
  if (!hasCompleted) return;

  state.todos = state.todos.filter((t) => !t.completed);
  saveTodos(state.todos);
  render();
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
    elements.themeToggle.textContent = "☀️";
  } else {
    root.classList.remove("light");
    elements.themeToggle.textContent = "🌙";
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(elements.input.value);
  elements.input.value = "";
  elements.input.focus();
});

elements.filter.addEventListener("change", () => {
  state.filter = elements.filter.value;
  render();
});

elements.clearCompleted.addEventListener("click", () => {
  clearCompleted();
});

elements.themeToggle.addEventListener("click", () => {
  const current = loadTheme();
  const next = current === "dark" ? "light" : "dark";
  saveTheme(next);
  applyTheme(next);
});

const initialTheme = loadTheme();
applyTheme(initialTheme);
render();
