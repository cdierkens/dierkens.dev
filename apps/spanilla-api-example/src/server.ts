import {
  VNode,
  VStyleSheet,
  css,
  html,
  installShim,
  render,
} from "@dierkens.dev/spanilla";
import cors from "@fastify/cors";
import fastify from "fastify";

await installShim();

const server = fastify();

server.register(cors);

const layout = (template: VNode | VNode[], styles: Array<VStyleSheet>) => html`
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Spanilla Example</title>

      <style>
        ${styles.map((styleSheet) => render(styleSheet)).join(" ")}
      </style>
    </head>
    <body>
      ${template}
    </body>
  </html>
`;

server.get("/", async (_, reply) => {
  reply.type("text/html");

  const h1Styles = css`
    & {
      text-align: center;
    }
  `;

  const pStyles = css`
    & {
      max-width: 600px;
      margin: 0 auto;
    }
  `;

  return render(
    layout(
      html`<h1 style="${h1Styles}">Hello Spanilla!</h1>
        <p style="${pStyles}">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>`,
      [h1Styles, pStyles],
    ),
  );
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
