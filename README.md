# TypeScript Setup
This is the base setup I use for most of my TypeScript projects.

## How to use
The `yarn eject` command will prepare this setup for use, removing unnecessary content for you (such as this `README.md`, example `src` and `test` files, etc). If you want to remove the `.git` folder too, you need to pass the `--remove-git-folder=true` flag after the `eject` command.

Examples:
```sh
yarn eject                                          # Will delete useless content only
yarn eject --remove-git-folder=anyNonTrueValue      # Same as previous
yarn eject --remove-git-folder=true                 # Will delete useless content and .git folder
```