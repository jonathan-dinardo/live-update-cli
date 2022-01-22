#!/usr/bin/env node
import { program } from 'commander';
import {configureApplicationCmdLine} from "./cmd/application.configure";
import {configureChannelCmdLine} from "./cmd/channel.configure";
import {configureBuildCmdLine} from "./cmd/build.configure";
import {configureCommand} from "./cmd/configure";
import {configureIonicCmd} from "./cmd/ionic.configure";

const chalk = require('chalk');
const figlet = require('figlet');
const VERSION = "1.1.1"
const logo =
  chalk.blue(
    figlet.textSync('LIVECL', { horizontalLayout: 'full' })
  ) + "  " + VERSION + '\n';



program
    .addHelpText('beforeAll', logo )
    .command('configure')
    .usage('[apikey]')
    .description('configure you api key')
    .option('-k, --api-key <apiKey>', 'Api key')
    .option('-k, --api-url <apiUrl>', 'Api url')
    .action(configureCommand);

configureApplicationCmdLine();
configureChannelCmdLine();
configureBuildCmdLine();
configureIonicCmd();

program.parse(process.argv);

if (!process.argv.slice(2).length) {
 // program.outputHelp();
}
