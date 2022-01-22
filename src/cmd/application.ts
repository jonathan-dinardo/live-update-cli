import fetch, {Response} from 'node-fetch';
import {defaultConfig} from "../config/config";
import Table  from 'cli-table';
import {logError, logInfo} from "../functions/logger";
import {askToProceed, headers, processResponse, requestConfirm} from "../functions/http.utils"; 
const url = defaultConfig.apiUrl;

export const applicationListingCommand = async () => {
    const response = await fetch(`${url}/apps`, { method: "GET", headers: headers()});
    await processResponse(response, async () => {
        const jsonArray: Array<{ id: string, name: string, createdAt: Date, updatedAt: Date }> = await response.json();
        printTable(jsonArray);
    });

}
export const applicationSearchByTextCommand = async (text: string) => {
    if ( !text ) {
        logError('text is mandatory');
        return;
    }
    const response = await fetch(`${url}/apps?text=${text}`, { method: "GET", headers: headers()});
    await processResponse(response, async () => printTable( await response.json()));
}

export const applicationAddCommand = async (name: string,  options: { yes: boolean }) => {
    if ( !name ) {
        logError('application name is mandatory');
        return;
    }
    if ( options.yes || await askConfirmation(name)) {
        const response = await fetch(`${url}/apps`, { method: "POST", body: JSON.stringify({ name: name }) , headers: headers()});
        await processResponse(response, async () => {
            const json = await response.json();
            logInfo(`Created application ${name} with id ${json.id}`);
        });
    }
}

export const applicationRmCommand = async (options: { applicationId: string, yes: boolean }) => {

    if ( options.yes || await askToProceed(`Are you sure to remove the application ${options.applicationId}`)) {
        const response: Response = await fetch(`${url}/apps/${options.applicationId}`, { method: "DELETE", headers: headers()});
        await processResponse(response, async () => {
            logInfo(`Deleted application with id ${options.applicationId}`);
        });
    }
}

export const applicationUpdateCommand  = async (options: { applicationId: string, name: string, yes: boolean }) => {
    if ( options.yes || await askConfirmation(options.name)) {
        const response = await fetch(`${url}/apps/${options.applicationId}`, { method: "PUT", body: JSON.stringify({ name: options.name }) , headers: headers()});
        await processResponse(response, async () => {
            logInfo(`Updated application with id ${options.applicationId}`);
        });
    }
}

const askConfirmation = async (name: string) => {
    return (await requestConfirm(
            `${url}/apps`,
            {name: name},
            `An application with name ${name} already exists. Proceed`)
    )
}

const printTable = (jsonArray: Array<any>) => {
    const table = new Table({
        head: ['Application Id', 'Name', 'Created at', 'Updated at']
        , colWidths: [40,30,28,28 ]
    });
    jsonArray.forEach( e => table.push([e.id, e.name, e.createdAt, e.updatedAt]));
    console.log(table.toString());
}

