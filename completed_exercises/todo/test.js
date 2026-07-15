const test = require('node:test');
const assert = require('node:assert/strict');

const {
  TodoStore,
  addTodo,
  listTodos,
  toggleTodo,
  deleteTodo,
  formatTodos,
  parseTodoCommand
} = require('./index');

test('adds todos with stable incrementing ids', () => {
  const store = new TodoStore();

  assert.deepEqual(addTodo(store, 'Write tests'), {
    id: 1,
    title: 'Write tests',
    completed: false
  });
  assert.deepEqual(addTodo(store, 'Implement app'), {
    id: 2,
    title: 'Implement app',
    completed: false
  });
});

test('lists active and completed todos without exposing store internals', () => {
  const store = new TodoStore();

  addTodo(store, 'Write tests');
  addTodo(store, 'Implement app');
  toggleTodo(store, 2);

  const todos = listTodos(store);

  assert.deepEqual(todos, [
    { id: 1, title: 'Write tests', completed: false },
    { id: 2, title: 'Implement app', completed: true }
  ]);

  todos[0].title = 'Changed outside the store';
  assert.equal(listTodos(store)[0].title, 'Write tests');
});

test('formats empty, active, and completed todo lists', () => {
  assert.equal(formatTodos([]), 'No todos yet.');

  assert.equal(
    formatTodos([
      { id: 1, title: 'Write tests', completed: false },
      { id: 2, title: 'Implement app', completed: true }
    ]),
    '[ ] 1. Write tests\n[x] 2. Implement app'
  );
});

test('toggles todo completion on and off', () => {
  const store = new TodoStore();

  addTodo(store, 'Write tests');

  assert.deepEqual(toggleTodo(store, 1), {
    id: 1,
    title: 'Write tests',
    completed: true
  });
  assert.deepEqual(toggleTodo(store, 1), {
    id: 1,
    title: 'Write tests',
    completed: false
  });
});

test('returns null when toggling a missing todo', () => {
  const store = new TodoStore();

  assert.equal(toggleTodo(store, 99), null);
});

test('deletes todos by id', () => {
  const store = new TodoStore();

  addTodo(store, 'Write tests');
  addTodo(store, 'Implement app');

  assert.equal(deleteTodo(store, 1), true);
  assert.deepEqual(listTodos(store), [
    { id: 2, title: 'Implement app', completed: false }
  ]);
});

test('returns false when deleting a missing todo', () => {
  const store = new TodoStore();

  assert.equal(deleteTodo(store, 99), false);
});

test('parses CLI-style commands and formats command output', () => {
  const store = new TodoStore();

  assert.equal(parseTodoCommand(['add', 'Write', 'tests'], store), 'Added todo #1: Write tests');
  assert.equal(parseTodoCommand(['list'], store), '[ ] 1. Write tests');
  assert.equal(parseTodoCommand(['toggle', '1'], store), 'Todo #1 is now completed.');
  assert.equal(parseTodoCommand(['list'], store), '[x] 1. Write tests');
  assert.equal(parseTodoCommand(['delete', '1'], store), 'Deleted todo #1.');
  assert.equal(parseTodoCommand(['list'], store), 'No todos yet.');
});
