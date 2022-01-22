import {program} from "commander";
import {
    channelAddCommand, channelInfoCommand,
    channelListingCommand,
    channelRmCommand,
    channelSearchByTextCommand,
    channelUpdateCommand
} from "./channel"; 

export const configureChannelCmdLine = () => {
    const channelCmd = program
        .command('channel')
        .description('channel')

    channelCmd
        .command('ls')
        .description('list channels')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .action(channelListingCommand);

    channelCmd
        .command('search [text]')
        .usage('[text]')
        .description('search channels by text')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .action(channelSearchByTextCommand);

    channelCmd
        .command('add [channelName]')
        .usage('[application name]')
        .description('add a new channel')
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .action(channelAddCommand);

    channelCmd
        .command('rm')
        .description('remove a channel')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Channel id')
        .option('-y, --yes', 'always yes')
        .action(channelRmCommand)

    channelCmd
        .command('update')
        .description('update channel')
        .action(channelUpdateCommand)
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Ch-gannel id')
        .requiredOption('-n, --name <name>', 'Channel name');
    channelCmd
        .command('info')
        .description('deploy info')
        .action(channelInfoCommand)
        .option('-y, --yes', 'always yes')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Channel id')


}
