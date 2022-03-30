import * as inspector from 'inspector';

function isOpen() {
  return !!inspector.url();
}

export function getInspectWsPath() {
  if (!isOpen()) {
    const port = 30000 + Math.floor(Math.random() * 10000);
    inspector.open(port);
  }

  const url = inspector.url();
  return url;
}

export function openNodeDevtool() {
  const url = getInspectWsPath();
  if (!url) {
    return;
  }

  let devtoolUrl = 'chrome://inspect/';

  if (process.env.DEVTOOL_FRONTEND_URL) {
    // remove first 5 char `ws://xxx` -> `xxx`
    devtoolUrl = process.env.DEVTOOL_FRONTEND_URL + url.substring(5);
  }

  if (!devtoolUrl) {
    return;
  }

  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  console.log('you can open the devtool url', devtoolUrl);
  require('child_process').exec(start + ' ' + devtoolUrl);
}
