import {program} from "commander";

import {
    buildAddCommand,
    buildListingCommand,
    buildUpdateCommand,
    buildRmCommand,
    buildSearchByTextCommand, buildActivateCommand
} from "./build";
import {channelUpdateCommand} from "./channel";

export const configureBuildCmdLine = () => {
    const buildCmd = program
        .command('build')
        .description('build')

    buildCmd
        .command('ls')
        .description('list builds')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channel>', 'Channel id')
        .action(buildListingCommand);

    buildCmd
        .command('search [text]')
        .usage('[text]')
        .description('search build by text')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channel>', 'Channel id')
        .action(buildSearchByTextCommand);

    buildCmd
        .command('add [name]')
        .usage('[name]')
        .description('upload new build')
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channel>', 'Channel id')
        .option('-n, --not-active', 'skip build activation', false)
        .option('-r, --replace-active', 'replace active build', false)
        .option('-d, --directory <directory>', 'directory')
        .action(buildAddCommand);

    buildCmd
        .command('rm')
        .description('remove a build')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Channel id')
        .requiredOption('-b, --build-id <buildId>', 'Build id')
        .option('-y, --yes', 'always yes')
        .action(buildRmCommand)

    buildCmd
        .command('update')
        .description('update build')
        .action(channelUpdateCommand)
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Channel id')
        .requiredOption('-b, --build-id <buildId>', 'Build id')
        .requiredOption('-n, --name <name>', 'Channel name')
        .action(buildUpdateCommand)
    buildCmd
        .command('setactive')
        .description('set active build')
        .action(channelUpdateCommand)
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Channel id')
        .requiredOption('-b, --build-id <buildId>', 'Build id')
        .action(buildActivateCommand)

}
