import FormData from 'form-data';
import * as fs from 'fs';
import {defaultConfig} from "../config/config";
const url = defaultConfig.apiUrl;
import fetch, {Response} from 'node-fetch';
import {askToProceed, headers, multipart, processResponse, requestConfirm} from "../functions/http.utils";
import {logError, logInfo} from "../functions/logger";
import {URL} from "url";
import Table from "cli-table";
import * as path from 'path';
import * as tmp from 'tmp';
import AdmZip from "adm-zip";

export const buildListingCommand = async (options: { applicationId: string,  channelId: string }) => {
    const buildEndPoint = new URL(`${url}/apps/${options.applicationId}/channels/${options.channelId}/builds`);
    const response = await fetch(`${buildEndPoint}`, {method: "GET", headers: headers()});
    await processResponse(response, async () => printBuildTable(await response.json()));
}
export const buildSearchByTextCommand = async (text: string,  options: { applicationId: string, channelId: string  }) => {
    if ( !text ) {
        logError('text is mandatory');
        return;
    }
    const buildEndPoint = new URL(`${url}/apps/${options.applicationId}/channels/${options.channelId}/builds`);
    const response = await fetch(`${buildEndPoint}?text=${text}`, { method: "GET", headers: headers()});
    await processResponse(response, async () => printBuildTable( await response.json()));
}


export const buildAddCommand = async (name: string,  options: { notActive: boolean, replaceActive: boolean, name?: string, channelId: string, applicationId: string,  yes?: boolean, directory?: string }) => {

    const www_dir = options.directory ?  `${options.directory}` : path.join(process.cwd(), 'www');
    if ( !fs.existsSync(www_dir)) {
        logError(`Directory ${www_dir} not exists. You can specify --directory option`);
        return;
    }
    const manifest_file = path.join(www_dir, 'pro-manifest.json');
    if ( !fs.existsSync(manifest_file)) {
        logError(`File ${manifest_file} not exists`);
        return;
    }

    const admZip = new AdmZip();
    const buffer: Array<any> = JSON.parse(fs.readFileSync(manifest_file).toString());
    buffer.push({
        'href': 'pro-manifest.json'
    });
    buffer.forEach( a => {
        const hrefFile = path.join(www_dir, a.href)
        if ( !fs.existsSync(hrefFile)) {
            logError(`File not exists ${hrefFile}`);
            return;
        }
        const buf = fs.readFileSync(hrefFile);
        admZip.addFile(a.href, buf);
    });

    const temp_file = tmp.fileSync({postfix: `archive.zip` });
    const target_file = temp_file.name;
    admZip.writeZip(target_file);
    const stats = fs.statSync(target_file);
    const fileSizeInBytes = stats.size;
    const fileStream = fs.createReadStream(target_file);
    const form = new FormData();
    logInfo(`Uploading ${target_file} ...`);
    const uploadUrl = `${url}/apps/${options.applicationId}/channels/${options.channelId}/builds`;
    form.append('active', `${!options.notActive}`);
    form.append('replaceActive', `${options.replaceActive}`);
    form.append('file', fileStream, { knownLength: fileSizeInBytes });
    if ( name ) {
        form.append('name', name);
    }
    const headers = form.getHeaders(multipart());
    const response = await fetch(uploadUrl, {
        method: 'post',
        body: form,
        headers: headers,
    });
    await processResponse(response, async () => {
        const json = await response.json();
        logInfo(`Created build with id ${json.id}`);
    });
    if ( fs.existsSync(target_file)) {
        fs.unlinkSync(target_file);
    }
};
export const buildRmCommand = async (options: { applicationId: string, channelId: string, buildId: string, yes: boolean }) => {

    const response_get: Response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}/builds/${options.buildId}`, {
        method: "GET",
        headers: headers()
    });

    await processResponse(response_get, async () => {
        const data = await response_get.json();
        const message = data.active ? `The build ${options.buildId} is active ! Are you sure to proceed` : `Are you sure to remove the build ${options.buildId}`;
        if ( options.yes || await askToProceed(message)) {
            const response: Response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}/builds/${options.buildId}`, {
                method: "DELETE",
                headers: headers()
            });
            await processResponse(response, async () => logInfo(`Deleted build with id ${options.buildId}`));
        }
    });

}

export const buildUpdateCommand = async (options: { applicationId: string, channelId: string, buildId: string, name: string, yes: boolean }) => {
    if (options.yes || await askConfirmation(options.applicationId, options.channelId, options.name)) {
        const response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}/builds/${options.buildId}`, {
            method: "PUT",
            body: JSON.stringify({name: options.name}),
            headers: headers()
        });
        await processResponse(response, async () => logInfo(`Updated build with id ${options.channelId}`));
    }
}

export const buildActivateCommand = async (options: { applicationId: string, channelId: string, buildId: string, name: string }) => {

    const response = await fetch(`${url}/apps/${options.applicationId}/channels/${options.channelId}/builds/${options.buildId}/active`, {
        method: "PUT",
        body: JSON.stringify({name: options.name}),
        headers: headers()
    });
    await processResponse(response, async () => logInfo(`Activated build id ${options.buildId}`));

}

const printBuildTable = (jsonArray: Array<any>) => {
    const table = new Table({
        head: ['Active','Build Id', 'Name', 'Created at', 'Updated at']
        , colWidths: [8,40, 30, 28, 28], colAligns: [ "middle", "left", "left", "left", "left"],
    });
    jsonArray.forEach(e => table.push([e.active ? "(*)" : "    ",  e.id, e.name, e.createdAt, e.updatedAt]));
    console.log(table.toString());
}
const askConfirmation = async (applicationId: string, channelId: string, buildName: string,): Promise<boolean> => {
    return await requestConfirm(`${url}/apps/${applicationId}/channels/${channelId}/builds`, {name: buildName}, `An build with name ${buildName} already exists. Proceed`);
}
