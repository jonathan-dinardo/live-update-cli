import {Response} from "node-fetch";
import {logFatal} from "./logger";

export const logFatalResponseError = async (response: Response) => {
    const json = await response.json();
    const message = json.message ?  json.message : json.error;
    logFatal(message ? message : 'An error occurred');
}
