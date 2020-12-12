const fs = require('fs');
const path = require('path');

const prompts = require('prompts');
const { spawn } = require('child_process');

const {
    getTemplate,
    copyFolderSync,
    rmdirRecursiveSync,
    colors,
} = require('./utils.js');

/**
 * Executes command
 * @param  {...any} command Exection parameters
 */
async function executeCommand(...command) {
    return new Promise((resolve, reject) => {
        const child = spawn(...command);

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject();
            }
        });
    });
}

/**
 * Creates project boilerplate
 * @param {string} projectName name of the project
 * @param {string} template name of the template
 */
async function createProject(projectName, template) {
    if (template === 'quickstart' || template === 'api') {
        // copy default template from templates directory
        const templatesDir = path.join(__dirname, '..', 'templates');
        copyFolderSync(path.join(templatesDir, template), projectName, [
            path.join(templatesDir, template, 'node_modules')
        ]);
    } else {
        // Execute git clone
        console.log(`\n${colors.green('>')} Fetching Template from GitHub ✨\n\n`);
        try {
            await executeCommand('git', ['clone', template, projectName], {
                stdio: [process.stdin, process.stdout, process.stderr]
            });
        } catch (err) {
            throw err;
        }
    }

    // Delete git history
    rmdirRecursiveSync(path.join(projectName, '.git'));
}

/**
 * main function that executes
 * @param {string} projectName name of the project
 * @param {object} options
 */
async function main(projectName, options) {
    // if projectName is falsy, prompt user for new name
    if (!projectName) {
        projectName = (
            await prompts({
                type: 'text',
                message: 'Enter Name of your project',
                name: 'projectName',
                initial: 'hello-world'
            })
        ).projectName;
    }

    projectName = projectName.toLowerCase().replace(/ |_/g, '-');
    const template = getTemplate(options.template);

    console.log(`\n${colors.green('>>')} Creating New FIWL App`);
    console.log(
        `${colors.cyan('Directory:')} ${projectName}\n${colors.cyan(
            'Template:'
        )} ${template}\n`
    );

    // Create project directory
    if (fs.existsSync(path.join(process.cwd(), projectName))) {
        console.log('\x1b[31m', 'project with the same name already exist');
        process.exit(0);
    } else {
        await createProject(projectName, template);
    }

    // Finish log
    console.log(`${colors.green('>')} Successfully created ${projectName}...`);
    console.log(
        `\n${colors.green('>>')} \`cd ${projectName}\` and http-server . -p 8080 ✨\n\n`
    );
}

module.exports = { main, executeCommand };
