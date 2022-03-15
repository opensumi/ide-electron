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
  console.log('inspector url: ', url);

  return url;
}

export function openNodeDevtool() {
  const url = getInspectWsPath();
  if (!url) {
    return;
  }

  const devtoolUrl = process.env.DEVTOOL_FRONTEND_URL
    ? ''
    : process.env.DEVTOOL_FRONTEND_URL + '?ws=' + url.substring(4);

  if (!devtoolUrl) {
    return;
  }

  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  require('child_process').exec(start + ' ' + url);
}
