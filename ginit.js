/**
 * Require npm dependencies
 */
var chalk       = require('chalk');
var clear       = require("cli-clear");
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Preferences = require('preferences');
var Spinner     = CLI.Spinner;
var GitHubApi   = require("github");
var _           = require('lodash');
var git         = require('simple-git')();
var touch       = require('touch');
var fs          = require('fs');

/**
 * Require own dependencies
 */
 var files = require('./lib/files');

 /**
  * Clear console
  */
clear();

/**
 * Print 'Ginit' ASCII art in green.
 */
console.log(
  chalk.green(
    figlet.textSync('Ginit', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
  )
);

/**
* Check if current directory has a .git directory
*/
/* COMMENTED OUT FOR TESTING PURPOSES
if(files.checkDirectoryExists('.git')) {
  console.log(chalk.red('This directory is already a git repository!'))
  process.exit();
}
*/

function getGithubCredentials(callback) {
  var questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username:',
      validate: function(input) {
        //  add better validation
        if (input.length) {
          return true;
        } else {
          return 'Please enter your username';
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function(input) {
        if (input.length) {
          return true;
        } else {
          return 'Please enter your passwprd';
        }
      }
    }
  ];
  inquirer.prompt(questions).then(callback);
}
