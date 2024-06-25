import { render } from "@dierkens.dev/spanilla/server";
import fastifyCookie from "@fastify/cookie";
import fastifyFormBody from "@fastify/formbody";
import fastify from "fastify";
import { Todo, todoPage } from "./todo.page";

const server = fastify();

server.register(fastifyFormBody);
server.register(fastifyCookie);

let todos: Set<Todo>;

server.addHook("onRequest", (request, _, done) => {
  const todosCookie = request.cookies.todos;
  if (todosCookie) {
    todos = new Set<Todo>();

    const parsedTodos = JSON.parse(todosCookie) as Todo[];
    for (const todo of parsedTodos) {
      todos.add(todo);
    }
  } else {
    todos = new Set<Todo>([
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
  reply.setCookie("todos", JSON.stringify([...todos]));

  done();
});

server.get("/", async (request, reply) => {
  reply.type("text/html");

  return render(todoPage([...todos], () => true, request.url));
});

server.get("/completed", async (request, reply) => {
  reply.type("text/html");

  return render(todoPage([...todos], (todo) => todo.completed, request.url));
});

server.get("/active", async (request, reply) => {
  reply.type("text/html");

  return render(todoPage([...todos], (todo) => !todo.completed, request.url));
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

server.post("*", async (request, reply) => {
  reply.type("text/html");

  const action = request.body as Action;

  if (action.action === "add") {
    todos.add({
      id: String(todos.size),
      label: action.label,
      completed: false,
    });
  } else if (action.action === "toggle") {
    for (const todo of todos) {
      if (todo.id === action.id) {
        todo.completed = !todo.completed;
      }
    }
  } else if (action.action === "complete-all") {
    for (const todo of todos) {
      todo.completed = true;
    }
  } else if (action.action === "delete") {
    for (const todo of todos) {
      if (todo.id === action.id) {
        todos.delete(todo);
      }
    }
  } else if (action.action === "clear-completed") {
    for (const todo of todos) {
      if (todo.completed) {
        todos.delete(todo);
      }
    }
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
