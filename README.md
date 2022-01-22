## Livecl ( command line)

This is a command line tool to use live update rest API.

### Configure
To configure your API credentials, enter the following code into the terminal:
```bash
$ livecl configure
```
Specify your API key
```bash
? Insert you api key
```
Next, livecl ask you the API URL. If you use rapidapi as gateway just type enter to accept the default settings, otherwise change the default value.
```bash
? Insert you api url › https://liveupdate1.p.rapidapi.com
```
If it's everything OK you should see:
```bash
Welcome <username>
```

If you are impatient with using liveupdate, scroll down and jump to the ionic section.

### Application
Listing applications.

```bash
$ livecl application ls
```
Create an application
```bash
$ livecl application add <applicatioName>
```

Delete an application
```bash
##Add -y to skip the request confirmation
$ livecl application rm -a <applicationId>
```
To change the application name
```bash
##Add -y to skip the request confirmation if same name already exists
$ livecl application update -a <applicationId> -n <applicatioName>
```
To search the applications using a partial text:
```bash
$ livecl application search <text>
``` 

### Channel
Listing the channels of an application

```bash
$ channel ls -a <applicationId>
``` 
Create a channel of the application
```bash
$ livecl channel add -a <applicationId> <channelName>
``` 
Delete a channel

```bash
##Add -y to skip the request confirmation
$ channel rm -a <applicationId> -c <channelId>
```

Update a channel name
```bash
##Add -y to skip the request confirmation if same name already exists
$ livecl channel update -a <applicationId> -c <channelId> -n <channelName>
```
To search the channels using a partial text:
```bash
$ livecl channel search -a <applicationId> <text>
```
To get helpful command line for ionic deploy plugin
```bash
$ livecl channel info -a <applicationId> -c <channelId>
```

### Build
For listing the builds of a specific application and channel.
```bash
$ livecl build ls -a <applicationId> -c <channelId>
```
To create and activate a build of a specific application and channel, go to the root of ionic project and execute the statement

```bash
## To skip the activation add --not-active ( -n )
## To remove the last active build add --replace-active ( -n )

$ livecl build add -a <applicationName> -c <channelName> <buildName> 
```
To deelete a build
```bash
##Add -y to skip the request confirmation
$ livecl build rm -a <applicationId> -c  <channelId> -b <buildId>
```
To update a build name
```bash
##Add -y to skip the request confirmation if same name already exists
$ livecl build update -a <applicationId> -c <channelId> -b <buildId> -n <buildName>
```
To search the builds using a partial text:
```bash
$ livecl build search -a <applicationId> -c <channelId> <text>
```
To activate a build
```bash
$ livecl build setactive -a <applicationId> -c <channelId> -b <buildId>
```

### ionic
To configure a ionic project, go to the root directory and enter the following command:
```bash
$ livecl ionic configure -a <applicationId> -c <channelId>
```
The files package.json and config.xml now are configured to work with liveupdate. Now deploy the app (a clean build is strongly recommended) to your device.
After, open and apply some visible changes to a page of your ionic app. Open a terminal and execute this command that compiles ad push a new update to the server:
```bash
$ npm run-script live-deploy
```
Restart the app and check if the update works correctly.

To create a new build enter the following code. It works like livecl add build command but it reads applicationId and channelId from the package.json.
```bash
$ livecl ionic deploy
```
Updated documentation is also avaiable on [https://liveupdate.magicdev.org](https://liveupdate.magicdev.org)
