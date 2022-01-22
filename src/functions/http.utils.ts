import prompts from "prompts";
import fetch, {HeadersInit, Response} from "node-fetch";
import {URL} from "url";
import {logFatalResponseError} from "./http.response";
import {defaultConfig} from "../config/config";

export const requestConfirm = async (url: string, params: any, message: string): Promise<boolean> => {
    return new Promise(async resolve => {
        const response_check = await query( url, params );
        if ( !response_check.ok ) {
            await logFatalResponseError(response_check);
            return;
        }
        const response_check_json = await response_check.json();
        if ( response_check_json.length === 0 ) {
            resolve(true);
            return;
        }
        const result = askToProceed(message);
        resolve(result);
    });
}
export const processResponse = async (response: Response, func: Function ) => {
    if (!response.ok) {
        await logFatalResponseError(response);
        return;
    }
    func();
}

const query = ( url: string, params: any): Promise<Response> =>{
    const urlObj = new URL(url);
    Object.keys(params).filter( (k: string) => {
        return !!params[k];
    }).forEach( k => {
        urlObj.searchParams.append(k, params[k]);
    });
    const href = urlObj.href;
    return fetch(`${href}`, { method: "GET", headers: headers()});
}
export const userHome = (): string => {
    return <string>process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

export const headers = ( contentType: string = 'application/json'): HeadersInit => {
    const config = defaultConfig;
    const headerName = config.headerName;
    const xApiKey = config.apiKey;
    return JSON.parse(
        `
        {
            "Content-Type": "${contentType}",
            "${headerName}": "${xApiKey}"                
        }
     `);

}

export const multipart = (): any => {
    const config = defaultConfig;
    const headerName = config.headerName;
    const xApiKey = config.apiKey;
    return JSON.parse(`{"${headerName}": "${xApiKey}"}`);
}

export const askToProceed = async (message: string) => {
    const result = await prompts.prompt({
        type: 'confirm',
        name: 'value',
        message: message,
        initial: false
    });
    return Promise.resolve(!!result.value);
}
