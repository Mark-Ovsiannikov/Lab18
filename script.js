/** @typedef {{id:number, text:string, checked:boolean}} Todo */

const STORAGE_KEY = 'todos-v1';

const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');

/** @type {Todo[]} */
let todos = loadFromStorage();

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedFromInitialHTML();
  } catch {
    return seedFromInitialHTML();
  }
}
function seedFromInitialHTML() {
  return [...list.querySelectorAll('li')].map((li, i) => {
    const input = li.querySelector('input[type="checkbox"]');
    const span = li.querySelector('label span');
    return {
      id: Number(input?.id) || i + 1,
      text: span?.textContent?.trim() || `Todo ${i + 1}`,
      checked: !!input?.checked,
    };
  });
}

function renderTodo(todo) {
  return `
<li class="list-group-item" data-id="${todo.id}">
  <input type="checkbox" class="form-check-input me-2" id="${todo.id}" ${todo.checked ? 'checked' : ''} />
  <label for="${todo.id}">
    <span class="${todo.checked ? 'text-success text-decoration-line-through' : ''}">
      ${escapeHtml(todo.text)}
    </span>
  </label>
  <button class="btn btn-danger btn-sm float-end">delete</button>
</li>`;
}

function render() {
  const html = todos.map(renderTodo).join('');
  list.innerHTML = html;
  updateCounter();
}

function updateCounter() {
  itemCountSpan.textContent = todos.length;
  uncheckedCountSpan.textContent = todos.filter(t => !t.checked).length;
}

window.newTodo = function newTodo() {
  const text = prompt('Введіть нову справу');
  if (!text || !text.trim()) return;

  const id = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  todos.push({ id, text: text.trim(), checked: false });
  saveToStorage();
  render();
};

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveToStorage();
  render();
}

function checkTodo(id, checked) {
  const item = todos.find(t => t.id === id);
  if (item) item.checked = checked;
  saveToStorage();
  render();
}

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' && e.target.closest('#todo-list')) {
    const li = e.target.closest('li[data-id]');
    const id = Number(li.dataset.id);
    deleteTodo(id);
  }
});

document.addEventListener('change', (e) => {
  if (e.target.matches('#todo-list input[type="checkbox"]')) {
    const id = Number(e.target.id);
    checkTodo(id, e.target.checked);
  }
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
  );
}

render();
