# Tabulator-Grinder
### A tabmanager for Firefox

## Description
A plugin to manage open browertabs and your computers recources by suspending and closing open, but long forgotten, browsertabs.  
You can configure how and when browsertabs should be suspended/closed.

## How it works
Tabulator-Grinder acts like a service, that runns every now and then and closes/suspends the oldest tab.  
You can configure how long this closing-interval is.
- statically (e.g. every 10 Minutes)
- dynamically (every 10 Minutes, when 15 Tabs are open; every 3 Minutes, if 25 Tabs are open)

## What you can configure
- The closing interval
- The minimum open tab count
- If new tabs should be closed on instant when they loose focus
- How many tabs should be suspended

## Contributing
Every contribution is wellcome!  
Please open as much issues and PRs as you wish!  
If you want to contribute to this, just do this steps
* `$ npm install`
* `$ npm run web-ext --overwrite-dest`
* The deployment have to be manually done by the maintainer: The new .zip can be uploaded to firefox
