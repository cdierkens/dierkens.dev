import { render } from "@dierkens.dev/spanilla/server";

import fastifyCookie from "@fastify/cookie";
import fastifyFormBody from "@fastify/formbody";
import * as esbuild from "esbuild";
import fastify from "fastify";
import path from "path";
import {
  addTodo,
  clearCompleted,
  completeAll,
  deleteTodo,
  getTodos,
  setTodos,
  toggleCompleted,
} from "./database";
import { layout } from "./layout.template";
import TodoPage, { Todo, data } from "./todo.page";

const result = await esbuild.build({
  entryPoints: [path.resolve(import.meta.dirname, "..", "src", "todo.page.ts")],
  bundle: true,
  minify: true,
  write: false,
  outdir: "runtime",
  platform: "neutral",
});

const server = fastify();

server.register(fastifyFormBody);
server.register(fastifyCookie);

server.addHook("onRequest", (request, _, done) => {
  const todosCookie = request.cookies.todos;
  let todos: Todo[];
  if (todosCookie) {
    todos = [];

    const parsedTodos = JSON.parse(todosCookie) as Todo[];
    for (const todo of parsedTodos) {
      todos.push(todo);
    }

    setTodos(todos);
  } else {
    setTodos([
      {
        id: "0",
        label: "Pay electric bill",
        completed: false,
      },
      {
        id: "1",
        label: "Walk the dog",
        completed: false,
      },
    ]);
  }

  done();
});

server.addHook("onSend", (_, reply, __, done) => {
  const todos = getTodos();

  reply.setCookie("todos", JSON.stringify(todos));

  done();
});

server.get("/runtime/*", async (request, reply) => {
  const file = result.outputFiles.find((value) =>
    value.path.endsWith("todo.page.js"),
  );

  if (!file) {
    reply.status(404);
    return;
  }

  reply.type("application/javascript");
  reply.send(file.contents);
});

server.get("*", async (request, reply) => {
  if (request.headers.accept?.includes("application/json")) {
    return data(request);
  }

  reply.type("text/html");

  return render(layout(TodoPage(data(request))));
});

server.post("*", async (request, reply) => {
  reply.type("text/html");

  const action = request.body as Action;

  if (action.action === "add") {
    addTodo(action.label);
  } else if (action.action === "toggle") {
    toggleCompleted(action.id);
  } else if (action.action === "complete-all") {
    completeAll();
  } else if (action.action === "delete") {
    deleteTodo(action.id);
  } else if (action.action === "clear-completed") {
    clearCompleted();
  }

  reply.redirect(request.url);
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

type AddAction = {
  action: "add";
  label: string;
};

type ToggleAction = {
  action: "toggle";
  id: string;
};

type CompleteAllAction = {
  action: "complete-all";
};

type DeleteAction = {
  action: "delete";
  id: string;
};

type ClearCompletedAction = {
  action: "clear-completed";
};

type Action =
  | AddAction
  | ToggleAction
  | CompleteAllAction
  | DeleteAction
  | ClearCompletedAction;
