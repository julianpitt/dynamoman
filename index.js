#! /usr/bin/env node

const program = require('commander');
const dynamoManager = require('./lib/dynamo-manager');

program
    .version('0.0.1')
    .description('DynamoDb cli management system')
    .option('-p, --profile [profile]', 'AWS profile');

program
    .command('seed <tablename>')
    .alias('s')
    .option('-j, --json [filepath]', 'JSON seed file path')
    .option('-c, --csv [filepath]', 'CSV seed file path')
    .option('-p, --profile [profile]', 'AWS profile to use')
    .description('Seed table')
    .action((tablename, options) => dynamoManager.seed(tablename, options));

program
    .command('backup <tablename>')
    .alias('s')
    .option('-j, --json [filepath]', 'JSON backup output file path')
    .option('-c, --csv [filepath]', 'CSV backup output file path')
    .option('-p, --profile [profile]', 'AWS profile to use')
    .description('Backup table to local file table')
    .action((tablename, options) => dynamoManager.backup(tablename, options));

// Assert that a VALID command is provided
if (!process.argv.slice(2).length || !/[s]/.test(process.argv.slice(2))) {
    program.outputHelp();
    process.exit();
}

program.parse(process.argv);
