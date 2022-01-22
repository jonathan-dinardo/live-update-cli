import fetch from "node-fetch";
import {askToProceed, headers, processResponse} from "../functions/http.utils";
import {URL} from "url";
import {defaultConfig} from "../config/config";
import path from "path";
import * as fs from "fs";
import {logError, logInfo} from "../functions/logger";
const url = defaultConfig.apiUrl;
import xml2js from 'xml2js';
import {buildAddCommand} from "./build";

const PACKAGE_JSON = 'package.json';
const CONFIG_XML = "config.xml";
const ALLOW_BACKUP = "android:allowBackup";
const FULL_BACKUP  = "android:fullBackupContent";

export const ionicConfigureCommand = async (options: { applicationId: string,  channelId: string, directory?: string, yes: boolean  }) => {
    const ionic_dir = options.directory ?  options.directory : process.cwd();
    const buildEndPoint = new URL(`${url}/apps/${options.applicationId}/channels/${options.channelId}/updateurl`);
    const response = await fetch(`${buildEndPoint}`, {method: "GET", headers: headers()});
    await processResponse( response, async () => {
        const jsonResponse = await response.json()
        validateIonicFile(ionic_dir);
        let packageJson = await parsePackageJson(ionic_dir);
        packageJson = await enableScript(packageJson);
        packageJson = await updateCordovaPluginSettings(packageJson, options.applicationId, options.channelId, jsonResponse.url);
        let configXmlFile = path.join(ionic_dir, CONFIG_XML);
        let packageJsonFile = path.join(ionic_dir, PACKAGE_JSON);
        let configXml = await enablePluginInConfigXml(ionic_dir);
        if ( options.yes || await askToProceed(`Are you sure to overwrite these files in ${ionic_dir}: ${CONFIG_XML}, ${PACKAGE_JSON}?`)) {
            fs.writeFileSync(configXmlFile, configXml);
            fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson,  null, 4));
        }
    });
}

export const ionicBuildCommand = async (name: string,  options: { notActive: boolean, replaceActive: boolean, directory?: string, yes?: boolean }) => {
    const ionic_dir = options.directory ?  options.directory : process.cwd();
    let packageJson = await parsePackageJson(ionic_dir);
    const cordovaPluginIonic = packageJson.cordova.plugins['cordova-plugin-ionic'];
    const applicationId = cordovaPluginIonic.APP_ID;
    const channelId = cordovaPluginIonic.CHANNEL_NAME;
    logInfo(`Using applicationId ${applicationId} and channel ${channelId}`);
    await buildAddCommand(name, {
        notActive: options.notActive,
        replaceActive: options.replaceActive,
        directory: options.directory,
        applicationId: applicationId,
        channelId: channelId
    });
}
const enablePluginInConfigXml = async (directory: string): Promise<string> => {
    const configXmlFile = path.join(directory, "config.xml");
    const configXmlAsString = fs.readFileSync(configXmlFile).toString("utf-8");
    const parser = new xml2js.Parser();
    const xml = await parser.parseStringPromise(configXmlAsString);
    const preferences: Array<any> = xml.widget.preference.filter( (p: any) => p.$.name === 'DisableDeploy');

    const platforms: Array<any> = xml.widget.platform.filter( (p: any) => p.$.name === 'android');
    if ( platforms.length > 0 ) {
        const platform = platforms[0];
        platform['edit-config'] = platform['edit-config'] ? platform['edit-config'] : [];
        const editConfigs: Array<any> = platform['edit-config'];
        if ( editConfigs.length > 0 ) {
            const applications: Array<any> = editConfigs[0].application.filter( (p:any) => !p.$[ALLOW_BACKUP] && !p.$[FULL_BACKUP]);
            applications.push({
                $: {
                    ALLOW_BACKUP: "false"
                }
            },{
                $: {
                    FULL_BACKUP: "false"
                },
            });
            editConfigs[0].application = applications;
        }
    }
    preferences.forEach( p => {
        p.$.value = 'false';
    });
    if ( preferences.length === 0)  {
        xml.widget.preference.push( {
            $: {
                name: 'DisableDeploy',
                value: 'false'
            }
        });
    }
    const builder = new xml2js.Builder();
    return  builder.buildObject(xml);
}
const validateIonicFile = ( directory: string ) => {
    validateExists(directory, CONFIG_XML);
    validateExists(directory, PACKAGE_JSON);
}

const validateExists =  ( directory: string, file: string ) => {
    const fileToCheck = path.join(directory, file);
    if (!fs.existsSync(fileToCheck)) {
        logError(`File ${fileToCheck} does not exist`);
        process.exit(1);
    }
}

const enableScript= async (packageJson: any): Promise<any> => {
    if  ( Object.keys(packageJson.scripts).filter( k => k ==='live-deploy').length === 0 ) {
        packageJson.scripts['live-deploy'] = 'npm run-script build && ionic deploy manifest && livecl ionic deploy';
    }
    return packageJson;
}

const parsePackageJson = async (directory: string) : Promise<any> => {
    const package_json_file = path.join(directory, "package.json");
    const contentFile =  fs.readFileSync(package_json_file).toString();
    return JSON.parse(contentFile);
}

const updateCordovaPluginSettings = async (packageJson: any, applicationId: string, channelId: string, updateUrl: string): Promise<any>  => {
    if ( packageJson && packageJson.cordova && packageJson.cordova.plugins ) {
        packageJson.cordova.plugins['cordova-plugin-ionic'] = {
            APP_ID: applicationId,
            CHANNEL_NAME: channelId,
            UPDATE_METHOD: 'auto',
            MAX_STORE: '2',
            MIN_BACKGROUND_DURATION: '30',
            UPDATE_API: updateUrl
        };
    }
    return packageJson;

}

