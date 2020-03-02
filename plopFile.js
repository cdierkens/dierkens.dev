const fuzzypath = require("inquirer-fuzzy-path");

module.exports = function(plop) {
  plop.setPrompt("fuzzypath", fuzzypath);

  plop.setGenerator("component", {
    description: "React component generator",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Input a name for your component:",
        default: "MyComponent"
      },
      {
        type: "fuzzypath",
        name: "path",
        excludePath: nodePath => nodePath.startsWith("node_modules"),
        excludeFilter: nodePath => nodePath === ".",
        itemType: "directory",
        rootPath: "src",
        message: "Select a target directory for your component:",
        default: "src/components",
        suggestOnly: true,
        depthLimit: 5
      }
    ],
    actions: [
      {
        type: "addMany",
        destination: "{{ path }}/{{ pascalCase name }}",
        templateFiles: "plop/templates/Component/*",
        base: "plop/templates/Component"
      }
    ]
  });
};
