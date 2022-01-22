import fetch, {Response} from "node-fetch";
import {URL} from "url";
import {defaultConfig} from "../config/config";
import Table from "cli-table";
const url = defaultConfig.apiUrl;
import {logError, logInfo} from "../functions/logger";
import {askToProceed, headers, processResponse, requestConfirm} from "../functions/http.utils";
import {logFatalResponseError} from "../functions/http.response";

export const channelListingCommand = async (options: { applicationId: string }) => {
    const channelEndPoint = new URL(`${url}/apps/${options.applicationId}/channels`);
    const response = await fetch(`${channelEndPoint}`, {method: "GET", headers: headers()});
    await processResponse(response, async () => printChannelTable(await response.json()));
}

export const channelSearchByTextCommand = async (text: string,  options: { applicationId: string }) => {
    if ( !text ) {
        logError('text is mandatory');
        return;
    }
    const response = await fetch(`${url}/apps/${options.applicationId}/channels?text=${text}`, { method: "GET", headers: headers()});
    await processResponse(response, async () => printChannelTable( await response.json()));
}

export const channelAddCommand = async (channelName: string, options: { applicationId: string, yes: boolean }) => {
    if (!channelName) {
        logError('channel name is mandatory');
        return;
    }
    if (options.yes || await askConfirmation(options.applicationId, channelName)) {
        const response = await fetch(`${url}/apps/${options.applicationId}/channels`, {
            method: "POST",
            body: JSON.stringify({name: channelName}),
            headers: headers()
        });
        await processResponse(response, async () => {
            const json = await response.json();
            logInfo(`Created channel ${channelName} with id ${json.id}`);
        });
    }
}
export const channelRmCommand = async (options: { applicationId: string, channelId: string, yes: boolean }) => {
    if ( options.yes || await askToProceed(`Are you sure to remove the channel ${options.channelId}`)) {
        const response: Response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}`, {
            method: "DELETE",
            headers: headers()
        });
        await processResponse(response, async () => logInfo(`Deleted channel with id ${options.channelId}`));
    }
}

export const channelUpdateCommand = async (options: { applicationId: string, channelId: string, name: string, yes: boolean }) => {
    if (options.yes || await askConfirmation(options.applicationId, options.name)) {
        const response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}`, {
            method: "PUT",
            body: JSON.stringify({name: options.name}),
            headers: headers()
        });
        await processResponse(response, async () => logInfo(`Updated channel with id ${options.channelId}`));
    }
}

const askConfirmation = async (applicationId: string, channelName: string,): Promise<boolean> => {
    return await requestConfirm(`${url}/apps/${applicationId}/channels`, {name: channelName}, `An channel with name ${channelName} already exists. Proceed`);
}

export const channelInfoCommand = async (options: { applicationId: string, channelId: string, yes: boolean }) => {
    const response: Response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}/updateinfo`, {
        method: "GET",
        headers: headers()
    });

    if (!response.ok) {
        await logFatalResponseError(response);
        return;
    }
    const text = await response.text();
    logInfo(text);
}

const printChannelTable = (jsonArray: Array<any>) => {
    const table = new Table({
        head: ['Channel Id', 'Name', 'Created at', 'Updated at']
        , colWidths: [40, 30, 28, 28]
    });
    jsonArray.forEach(e => table.push([e.id, e.name, e.createdAt, e.updatedAt]));
    console.log(table.toString());
}
