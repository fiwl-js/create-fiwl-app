#!/usr/bin/env node
const { program } = require('commander');
const { main } = require('../lib/actions.js');

program.version(require('../package.json').version, '-v|--version');

// main

/**
 * create-fiwl-app [projectName] --template <template>
 */
program
  .option('-t|--template <template>', 'Specify template for FIWL app')
  .arguments('[projectName]')
  .action((projectName) =>
    main(projectName, {
      template: program.template
    })
  );

program.parse(process.argv);