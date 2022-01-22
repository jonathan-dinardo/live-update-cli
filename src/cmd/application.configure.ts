import {
    applicationAddCommand,
    applicationListingCommand,
    applicationRmCommand, applicationSearchByTextCommand,
    applicationUpdateCommand
} from "./application";
import {program} from "commander";

export const configureApplicationCmdLine = () => {
    const applicationCmd = program
        .command('application')
        .description('application')

    applicationCmd
        .command('ls')
        .description('show all applications')
        .action(applicationListingCommand);

    applicationCmd
        .command('search [text]')
        .usage('[text]')
        .description('search applications by text')
        .action(applicationSearchByTextCommand);

    applicationCmd
        .command('add [name]')
        .usage('[application name]')
        .description('add a new application')
        .option('-y, --yes', 'always yes')
        .action(applicationAddCommand);



    applicationCmd
        .command('rm')
        .description('remove application')
        .action(applicationRmCommand)
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id');

    applicationCmd
        .command('update')
        .description('update application')
        .option('-y, --yes', 'always yes')
        .action(applicationUpdateCommand)
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-n, --name <name>', 'Application name');

    return applicationCmd;
}

