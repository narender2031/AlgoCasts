// --- Description
// Create a small in-memory TODO app.
//
// The TodoStore class keeps todos for the lifetime of the current process.
// Each todo should have a stable numeric id, a title, and a completed state.
//
// The exported helper functions below form the public exercise API, and the
// command-line entry point at the bottom lets this file be run directly.

class TodoStore {
  constructor() {
    this.todos = [];
    this.nextId = 1;
  }

  addTodo(title) {
    const todo = {
      id: this.nextId,
      title,
      completed: false
    };

    this.nextId += 1;
    this.todos.push(todo);

    return { ...todo };
  }

  listTodos() {
    return this.todos.map(todo => ({ ...todo }));
  }

  toggleTodo(id) {
    const todo = this.todos.find(todo => todo.id === Number(id));

    if (!todo) {
      return null;
    }

    todo.completed = !todo.completed;

    return { ...todo };
  }

  deleteTodo(id) {
    const todoIndex = this.todos.findIndex(todo => todo.id === Number(id));

    if (todoIndex === -1) {
      return false;
    }

    this.todos.splice(todoIndex, 1);
    return true;
  }
}

function addTodo(store, title) {
  return store.addTodo(title);
}

function listTodos(store) {
  return store.listTodos();
}

function toggleTodo(store, id) {
  return store.toggleTodo(id);
}

function deleteTodo(store, id) {
  return store.deleteTodo(id);
}

function formatTodos(todos) {
  if (todos.length === 0) {
    return 'No todos yet.';
  }

  return todos
    .map(todo => {
      const status = todo.completed ? 'x' : ' ';
      return `[${status}] ${todo.id}. ${todo.title}`;
    })
    .join('\n');
}

function parseTodoCommand(args, store = new TodoStore()) {
  const [command, ...rest] = args;

  if (command === 'add') {
    const title = rest.join(' ').trim();

    if (!title) {
      return 'Please provide a todo title.';
    }

    const todo = addTodo(store, title);
    return `Added todo #${todo.id}: ${todo.title}`;
  }

  if (command === 'list') {
    return formatTodos(listTodos(store));
  }

  if (command === 'toggle') {
    const todo = toggleTodo(store, rest[0]);

    if (!todo) {
      return `Todo #${rest[0]} was not found.`;
    }

    const status = todo.completed ? 'completed' : 'active';
    return `Todo #${todo.id} is now ${status}.`;
  }

  if (command === 'delete') {
    const wasDeleted = deleteTodo(store, rest[0]);

    if (!wasDeleted) {
      return `Todo #${rest[0]} was not found.`;
    }

    return `Deleted todo #${rest[0]}.`;
  }

  return 'Usage: node index.js add <title> | list | toggle <id> | delete <id>';
}

if (require.main === module) {
  const store = new TodoStore();
  console.log(parseTodoCommand(process.argv.slice(2), store));
}

module.exports = {
  TodoStore,
  addTodo,
  listTodos,
  toggleTodo,
  deleteTodo,
  formatTodos,
  parseTodoCommand
};
