import { Template, VStyleSheet, html } from "@dierkens.dev/spanilla";
import { render } from "@dierkens.dev/spanilla/server";

export function layout(template: Template, styleSheets: VStyleSheet[] = []) {
  return html`
    <html lang="en" data-framework="spanilla">
      <head>
        <meta charset="UTF-8" />
        <meta name="description" content="A TodoMVC written with Spanilla." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>TodoMVC: Spanilla</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/todomvc-app-css/index.css"
        />
        <style>
          ${styleSheets.map((styleSheet) => render(styleSheet)).join(" ")}
        </style>

        <script type="module">
          import TodoPage, { mount } from "./runtime/todo.page.js";

          const data = await fetch(window.location.pathname, {
            headers: {
              Accept: "application/json",
            },
          }).then((response) => response.json());

          // TODO: Make page selection dynamic.
          mount(document.getElementById("app"), TodoPage(data), {
            replace: true,
          });
        </script>
      </head>
      <body>
        <div id="app">${template}</div>
      </body>
    </html>
  `;
}
