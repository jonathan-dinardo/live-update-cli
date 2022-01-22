import {program} from "commander";
import {ionicBuildCommand, ionicConfigureCommand} from "./ionic";

export const configureIonicCmd = () => {
    const ionicCmd = program
        .command('ionic')
        .description('ionic configuration project')

    ionicCmd
        .command('configure')
        .description('configure ionic project')
        .requiredOption('-a, --application-id <applicationId>', 'Application id')
        .requiredOption('-c, --channel-id <channelId>', 'Channel id')
        .option('-d, --directory <directory>', 'directory')
        .option('-y, --yes', 'always yes')
        .action(ionicConfigureCommand)

    ionicCmd
        .command('deploy [name]')
        .usage('[name]')
        .description('create a build ionic project')
        .option('-d, --directory <directory>', 'directory')
        .option('-n, --not-active', 'skip build activation', false)
        .option('-r, --replace-active', 'replace active build', false)
        .action(ionicBuildCommand)


    return ionicCmd;
}

