#!/usr/bin/env node

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
          return 'Please enter your password';
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
  * TODO: add two step authentcation
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
          type: 'basic'
        },
        credentials
      )
    );

    /**
    * Create access token for our application on current machine
    */
    github.authorization.create({
        scopes: ['user', 'public_repo', 'repo', 'repo:status'],
        note: 'ginit, the super powered git init'
    }, function(err, res) {
        spinner.stop();
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
/*
getGithubToken(function(){
  console.log(arguments);
});
*/
function createRepo(callback) {
  var argv = require('minimist')(process.argv.slice(2));

  var questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the repository:',
      default: argv._[0] || files.getCurrentWorkingDirectory(),
      validate: function(input) {
        if (input.length) {
          return true;
        } else {
          return 'Please enter a name for the repository';
        }
      }
    },
    {
      type: 'input',
      name: 'description',
      default: argv._[1] || null,
      message: 'Optionally enter a description of the repository:'
    },
    {
      type: 'list',
      name: 'visibility',
      message: 'Is this a public or private repository?',
      choices: ['Public', 'Private'],
      default: 'Public'
    }
  ];

  inquirer.prompt(questions).then(function(answers) {
    var spinner = new Spinner('Creating repository...');
    spinner.start();

    var data = {
      name: answers.name,
      description: answers.description,
      private: (answers.visibility === 'private')
    };

    github.repos.create(
      data,
      function(err,res) {
        spinner.stop();
        if (err) {
          return callback(err);
        }
        return callback(null, res.ssh_url);
      }
    )
  })
}

function createGitIgnore(callback) {
  var filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

  if (filelist.length) {
    inquirer.prompt(
      [
        {
          type: 'checkbox',
          name: 'ignore',
          message: 'Select the files and/or folders you would to ignore:',
          choices: filelist,
          default: ['node_modules', 'bower_components']
        }
      ]
    ).then(function(answers) {
      if (answers.ignore.length) {
        fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
      } else {
        touch('.gitignore');
      }
      return callback();
    })
  } else {
    touch('.gitignore');
    return callback();
  }
}

function setupRepo(url, callback) {
  var spinner = new Spinner('Setting up the repository...');
  spinner.start();

  git
    .init()
    .add('.gitignore')
    .add('./*')
    .commit('Initial commit')
    .addRemote('origin', url)
    .push('origin', 'master')
    .then(function() {
      spinner.stop();
      return callback();
    });
}

function githubAuth(callback) {
  getGithubToken(function(err, token) {
    if (err) {
      return callback(err);
    }
    github.authenticate({
      type: 'oauth',
      token: token
    });
    return callback(null, token);
  });
}

githubAuth(function(err, authed) {
  if (err) {
    switch (err.code) {
      case 401:
        console.log(chalk.red('Couldn\'t log in. Please try again.'));
        break;
      case 422:
        console.log(chalk.red('You already have an access token.'));
        break;
    }
  }
  if (authed) {
    console.log(chalk.green('Successfully authenticated!'));
    createRepo(function (err, url) {
      if (err) {
        console.log('An error has occured');
      }
      if (url) {
        createGitIgnore(function() {
          setupRepo(url, function(err) {
            if(!err) {
              console.log(chalk.green('Finished!'));
            }
          });
        });
      }
    });
  }
});
