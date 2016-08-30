# ginit.js
ginit.js (or ginit) is a JavaScript CLI for quickly bootstrapping a Git project.

It runs git init under the hood, but not only that. 
It will also create a remote repository on Github or BitBucket right from the command line.
Ginit generates a .gitignore file  created from templates from [gitignore.io](https://www.gitignore.io/) based on the users needs.
Finally, it performs an initial commit and pushes to the master branch.

## Installation

Install using

    npm install -g ginit
    
## Usage

Run using

    ginit

## Future
1. [ ] BitBucket support
2. [ ] Gitignore.io templates
3. [ ] Refractor code
4. [ ] Better validation to prompts
5. [ ] Two Step Validation for Github
