# DynamoMan
A small command line to manage your dynamodb tables during the development phase of your application

Supported commands:
- seed - Seed your database from a csv or json file
- backup - Create a backup of your dynamodb table to csv or json format



Built with commander


```
Usage:  [options] [command]

  DynamoDb cli management system


  Options:

    -V, --version            output the version number
    -p, --profile [profile]  AWS profile
    -h, --help               output usage information


  Commands:

    seed|s [options] <tablename>    Seed table
    backup|s [options] <tablename>  Backup table to local file table
```

## Examples

### Seed

#### With a csv file
dynamoman seed my-pretend-table -c data/my-pretend-table-data-export.csv

#### With a profile and csv file
dynamoman seed my-pretend-table -c data/my-pretend-table-data-export.csv -p my-local-aws-profile
