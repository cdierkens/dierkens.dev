import { Todo } from "./todo.page";

let todos = new Set<Todo>();

export function addTodo(label: string) {
  const id = String(todos.size);
  todos.add({ id, label, completed: false });
}

export function deleteTodo(id: string) {
  for (const todo of todos) {
    if (todo.id === id) {
      todos.delete(todo);
    }
  }
}

export function toggleCompleted(id: string) {
  for (const todo of todos) {
    if (todo.id === id) {
      todo.completed = !todo.completed;
    }
  }
}

export function completeAll() {
  for (const todo of todos) {
    todo.completed = true;
  }
}

export function clearCompleted() {
  for (const todo of todos) {
    if (todo.completed) {
      todos.delete(todo);
    }
  }
}

export function setTodos(value: Todo[]) {
  todos = new Set(value);
}

export function getTodos() {
  return Array.from(todos);
}
