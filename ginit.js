/**
 * Require npm dependencies
 */
var chalk       = require('chalk');
var clear       = require("cli-clear");
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var _           = require('lodash');
var git         = require('simple-git')();
var touch       = require('touch');
var fs          = require('fs');
var Preferences = require('preferences');

/**
*
*/
var CLI         = require('clui');
var Spinner     = CLI.Spinner;

/**
*
*/
var GitHubApi   = require("github");
var github      = new GitHubApi({ version: '3.0.0'})
/**
 * Require own dependencies
 */
 var files      = require('./lib/files');

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

/**
* Prompt user for Github Credentials
* TODO: add better validation
*/
function getGithubCredentials(callback) {
  var questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username:',
      validate: function(input) {
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

function getGithubToken(callback) {
  /**
  * Create a new preferences file named 'ginit'. If it exists, then read the contents and decode into JSON
  */
  var prefs = new Preferences('ginit');

  /**
  * Check if 'ginit' perferences file already has a Github token in storage
  */
  if (prefs.github && prefs.github.token) {
    return callback(null, prefs.github.token);
  }

  /**
  * If no Github token was found, prompt user for credentials and fetch token
  */
  getGithubCredentials(function(credentials) {
    /**
    *   Create instance of staus spinner and start ut
    */
    var spinner = new Spinner('Authenticating, please wait...');
    spinner.start();

    /**
    * Perform basic authentication with Github using credentials that user entered
    * _.extend() combines multiple objects into one object
    */
    github.authenticate(
      _.extend(
        {
          type: 'basic',
        },
        credentials
      )
    );

    /**
    * Create access token for our application on current machine
    */
    github.authorization.create({
        scopes: ['user', 'public_repo', 'repo', 'repo::status'],
        note: 'ginit, the super powered git init'
    }, function(err, res) {
        status.stop();
        if (err) {
            return callback(err);
        }
        if (res.token) {
            prefs.github = {
                token: res.token
            };
            return callback(null, res.token);
        }
        return callback();
    });
  });
}
