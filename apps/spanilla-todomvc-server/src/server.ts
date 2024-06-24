import { Router, Signal, html } from "@dierkens.dev/spanilla";
import { render } from "@dierkens.dev/spanilla/server";
import cors from "@fastify/cors";
import fastify from "fastify";
import { layout } from "./templates/layout";

const server = fastify();

server.register(cors);

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

server.get("*", async (request, reply) => {
  reply.type("text/html");

  return render(
    layout(html`
      <header class="header">
        <h1>todos</h1>
        <input
          id="new-todo"
          class="new-todo"
          placeholder="What needs to be done?"
          autofocus
        />
      </header>

      <main class="main">
        <div class="toggle-all-container">
          <input class="toggle-all" id="toggle-all" type="checkbox" />
          <label class="toggle-all-label" for="toggle-all"
            >Mark all as complete</label
          >
        </div>
        <ul class="todo-list">
          ${Router({
            routes: {
              "/": html`<li class="todo">Hello, World!</li>`,
              "/active": html`<li class="todo">Active</li>`,
              "/completed": html`<li class="todo">Completed</li>`,
            },
            pathname: Signal(request.url),
          })}
        </ul>
      </main>

      <footer class="footer">
        <span class="todo-count"></span>
        <ul class="filters">
          ${links.map((link) => {
            return html`
              <li>
                <a
                  href="${link.href}"
                  class="${request.url === link.href ? "selected" : ""}"
                  >${link.label}</a
                >
              </li>
            `;
          })}
        </ul>
        <button class="clear-completed">Clear completed</button>
      </footer>
    `),
  );
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
