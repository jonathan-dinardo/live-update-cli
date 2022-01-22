import fetch from 'node-fetch';
import prompts from "prompts";
import {processResponse} from "../functions/http.utils";
import * as path from 'path';
import * as fs from 'fs';
import {logError, logInfo} from "../functions/logger";
import validator from "validator";
import {defaultConfig, userConfigFile} from "../config/config";

const validateApiKey = ( apiKey: string )  => {
    const valueString = `${apiKey}`;
    return !validator.isEmpty(valueString);
}

export const configureCommand = async (options: { apiKey: string, apiUrl: string }) => {
    let key = options.apiKey;
    if ( key && !validateApiKey(key)) {
        logError("Invalid api key format");
        return;
    }
    if ( !key ) {
        key = await askApiKey(options);
    }

    let apiUrl = options.apiUrl;

    if ( apiUrl && !validator.isURL(apiUrl)) {
        logError("Invalid api url format");
        return;
    }

    if ( !apiUrl ) {
        apiUrl = await askApiUrl(options);
    }
    let headerName = 'x-api-key';
    if ( apiUrl.indexOf('rapidapi.com') > -1) {
        headerName = 'x-rapidapi-key'
    }
    const headers = JSON.parse(`{ "${headerName}" : "${key}" }`);
    const response = await fetch(`${apiUrl}/profile`, { method: "GET", headers: headers });
    await processResponse(response, async () => {
        const json = await response.json();
        const userFile = userConfigFile();
        const dir = path.dirname(userFile);
        if ( !fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true});
        }
        const configJson = {
            'apiKey': key,
            'headerName': headerName,
            'apiUrl': apiUrl
        };
        fs.writeFileSync(userFile, JSON.stringify(configJson));
        logInfo(`Welcome ${JSON.stringify(json.username)}`)
    });
}

const askApiKey = async (options: { apiKey: string }): Promise<string> => {
    const config = defaultConfig;
    let key = options.apiKey;
    let message = 'Insert you api key';
    if (!key) {
        const promptResponse = await prompts({
            type: 'text',
            name: 'apiKey',
            message: message,
            validate: _value => {
                const value: string = _value ? _value : config.apiKey;
                return validateApiKey(value);
            },
            initial: config.apiKey
        });
        key = promptResponse.apiKey ? promptResponse.apiKey : config.apiKey
        return key;
    } else {
        if (!validateApiKey(key)) {
            logError("Invalid api key format");
        }
    }
    return Promise.resolve('');
}

const askApiUrl = async (options: { apiUrl: string }): Promise<string> => {
    const config = defaultConfig;
    const _default_api_url: string = config.apiUrl ? config.apiUrl : "https://liveupdate1.p.rapidapi.com";
    let apiUrl = options.apiUrl;
    let message = 'Insert you api url';
    if (!apiUrl) {
        const promptResponse = await prompts({
            type: 'text',
            name: 'apiUrl',
            message: message,
            validate: _value => {
                const value: string = _value ? _value : _default_api_url;
                return  validator.isURL(value);
            },
            initial: _default_api_url
        });
        return promptResponse.apiUrl ? promptResponse.apiUrl : _default_api_url;
    } else {
        if (!validator.isURL(apiUrl)) {
            logError("Invalid api key format");
        }
    }
    return Promise.resolve('');
}
