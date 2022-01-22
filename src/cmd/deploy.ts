import fetch from 'node-fetch';

export const deployCommand = async (options: { assetsFile: string }) => {
    const response = await fetch('https://github.com/');
    console.log(response);
}

export const undeployCommand = async (options: { assetsFile: string }) => {
    const response = await fetch('https://github.com/');
    console.log(response);
}

