const fuzzypath = require("inquirer-fuzzy-path");

module.exports = function(plop) {
  plop.setPrompt("fuzzypath", fuzzypath);
  plop.setActionType("list", function(answers, config, plop) {
    return "\n\nUsage: plop <generator>\n\nGenerators"
      .concat(
        plop
          .getGeneratorList()
          .filter(generator => generator.name !== "list")
          .map(generator => `\n  ${generator.name}\t${generator.description}`)
      )
      .concat("\n");
  });

  plop.setGenerator("list", {
    prompts: [],
    actions: [
      {
        type: "list"
      }
    ]
  });

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
        // excludePath :: (String) -> Bool
        // excludePath to exclude some paths from the file-system scan
        excludeFilter: nodePath => nodePath === ".",
        // excludeFilter :: (String) -> Bool
        // excludeFilter to exclude some paths from the final list, e.g. '.'
        itemType: "directory",
        // itemType :: 'any' | 'directory' | 'file'
        // specify the type of nodes to display
        // default value: 'any'
        // example: itemType: 'file' - hides directories from the item list
        rootPath: "src",
        // rootPath :: String
        // Root search directory
        message: "Select a target directory for your component:",
        default: "src/components",
        suggestOnly: true,
        // suggestOnly :: Bool
        // Restrict prompt answer to available choices or use them as suggestions
        depthLimit: 5
        // depthLimit :: integer >= 0
        // Limit the depth of sub-folders to scan
        // Defaults to infinite depth if undefined
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
