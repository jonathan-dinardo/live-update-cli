import fs from "fs";
import {userHome} from "../functions/http.utils";
import path from "path";

export class Config {
    apiUrl?: string;
    headerName?: string;
    apiKey?: string;
}
export const userConfigFile = (): string => {
    const directory = path.join(userHome(), '.livecli');
    return path.join(directory, "credentials");
}
export const loadConfig = (): Config => {
    const configFile = userConfigFile();
    if ( !fs.existsSync(configFile) ) {
        return {};
    }
    const buffer = fs.readFileSync(configFile);
    return JSON.parse(buffer.toLocaleString());
}
export const defaultConfig = loadConfig();
