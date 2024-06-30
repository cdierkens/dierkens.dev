import { Router, createComponent, html } from "@dierkens.dev/spanilla";
import { FastifyRequest } from "fastify";
import { getTodos } from "./database";

export interface Todo {
  id: string;
  label: string;
  completed: boolean;
}

export { mount } from "@dierkens.dev/spanilla";

export function data(request: FastifyRequest) {
  const todos = getTodos();

  if (request.url === "/active") {
    return {
      todos,
      filteredTodos: todos.filter((todo) => !todo.completed),
    };
  }

  if (request.url === "/completed") {
    return {
      todos,
      filteredTodos: todos.filter((todo) => todo.completed),
      url: request.url,
    };
  }

  return {
    todos,
    filteredTodos: todos,
  };
}

export default function TodoPage({ todos }: ReturnType<typeof data>) {
  const links = [
    {
      label: "All",
      href: "/",
    },
    {
      label: "Active",
      href: "/active",
    },
    {
      label: "Completed",
      href: "/completed",
    },
  ];

  return html`
    <section class="todoapp">
      <header class="header">
        <h1 class="todo">todos</h1>

        <form method="POST">
          <input type="hidden" name="action" value="add" />

          <input
            data-test="new-todo"
            id="new-todo"
            name="label"
            class="new-todo"
            placeholder="What needs to be done?"
          />
        </form>
      </header>

      <main class="main">
        <div class="toggle-all-container">
          <form method="POST">
            <input type="hidden" name="action" value="complete-all" />

            <input
              class="toggle-all"
              id="toggle-all"
              type="checkbox"
              onchange="this.form.submit()"
              checked="${todos.some((todo) => !todo.completed)}"
            />

            <label class="toggle-all-label" for="toggle-all"
              >Mark all as complete</label
            >
          </form>
        </div>

        ${TodoListRouter({ todos })}
      </main>

      <footer class="footer">
        <span class="todo-count">
          ${todos.filter((todo) => !todo.completed).length} items left
        </span>

        <ul class="filters">
          ${links.map((link) => {
            return Router({
              fallback: html`${Link(link)}`,
              routes: {
                [link.href]: () => html`${Link({ ...link, selected: true })}`,
              },
            });
          })}
        </ul>

        ${todos.some((todo) => todo.completed)
          ? html`<form method="POST">
              <input type="hidden" name="action" value="clear-completed" />

              <button type="submit" class="clear-completed">
                Clear completed
              </button>
            </form>`
          : null}
      </footer>
    </section>
  `;
}

const TodoListRouter = createComponent(({ todos }: { todos: Todo[] }) => {
  return html`${Router({
    routes: {
      "/": () => TodoList({ todos }),
      "/active": () =>
        TodoList({ todos: todos.filter((todo) => !todo.completed) }),
      "/completed": () =>
        TodoList({ todos: todos.filter((todo) => todo.completed) }),
    },
  })}`;
});

const TodoList = ({ todos }: { todos: Todo[] }) => {
  return html`
    <ul class="todo-list">
      ${todos.map((todo, index) => {
        return html`
          <li class="todo-item ${todo.completed ? "completed" : ""}">
            <div class="view">
              <form method="POST">
                <input type="hidden" name="action" value="toggle" />

                <input type="hidden" name="id" value="${todo.id}" />

                <input
                  class="toggle"
                  id="todo-${index}"
                  type="checkbox"
                  checked="${todo.completed}"
                  onchange="this.form.submit()"
                />

                <label for="todo-${index}">${todo.label}</label>
              </form>

              <form method="POST">
                <input type="hidden" name="action" value="delete" />

                <input type="hidden" name="id" value="${todo.id}" />

                <button type="submit" class="destroy"></button>
              </form>
            </div>

            <input class="edit" value="${todo.label}" />
          </li>
        `;
      })}
    </ul>
  `;
};

const Link = createComponent(
  ({
    href,
    label,
    selected,
  }: {
    href: string;
    label: string;
    selected?: boolean;
  }) => {
    return html`
      <li>
        <a href="${href}" class="${selected ? "selected" : ""}">${label}</a>
      </li>
    `;
  },
);
