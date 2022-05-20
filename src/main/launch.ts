import { join } from 'path';
import { app } from 'electron';
import { existsSync, statSync, ensureDir } from 'fs-extra';
import { ElectronMainApp } from '@opensumi/ide-core-electron-main';
import { isOSX, URI } from '@opensumi/ide-core-common';
import { MainModule } from './services';
import { OpenSumiDesktopMainModule } from './module';
import { WebviewElectronMainModule } from '@opensumi/ide-webview/lib/electron-main';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const getResourcesPath = () => {
  const appPath = app.getAppPath();
  if (appPath.indexOf('app.asar') > -1) {
    return join(appPath, '..');
  }
  return appPath;
};

const getExtensionDir = () => join(getResourcesPath(), 'extensions');

if (isOSX) {
  process.env.MAC_RESOURCES_PATH = getResourcesPath();
  console.log('MAC_RESOURCES_PATH', process.env.MAC_RESOURCES_PATH);
}

const electronApp = new ElectronMainApp({
  browserNodeIntegrated: true,
  browserUrl: URI.file(join(__dirname, '../browser/index.html')).toString(),
  modules: [MainModule, WebviewElectronMainModule, OpenSumiDesktopMainModule],
  nodeEntry: join(__dirname, '../node/index.js'),
  extensionEntry: join(__dirname, '../extension/index.js'),
  extensionWorkerEntry: join(__dirname, '../extension/index.worker.js'),
  webviewPreload: join(__dirname, '../webview/host-preload.js'),
  plainWebviewPreload: join(__dirname, '../webview/plain-preload.js'),
  browserPreload: join(__dirname, '../browser/preload.js'),
  extensionDir: getExtensionDir(),
  extensionCandidate: [],
  overrideWebPreferences: {},
});

export async function launch(workspace?: string) {
  console.log('workspace', workspace);

  await Promise.all([electronApp.init(), app.whenReady(), ensureDir(getExtensionDir())]);

  await installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: { allowFileAccess: true },
    forceDownload: true,
  })
    .then((name) => console.log(`Added Extension:  ${name}`))
    .then(() => {})
    .catch((err) => console.error('An error occurred: ', err));

  if (!workspace || !existsSync(workspace)) {
    if (electronApp.getCodeWindows().length === 0) {
      electronApp.loadWorkspace(undefined, undefined);
    } else {
      electronApp.getCodeWindows()[1].getBrowserWindow().show();
    }
  } else {
    const s = statSync(workspace);
    if (s.isDirectory()) {
      const workspaceURI = URI.file(workspace);
      for (const window of electronApp.getCodeWindows()) {
        if (window.workspace && window.workspace.isEqual(workspaceURI)) {
          window.getBrowserWindow().show();
          return;
        }
      }
      electronApp.loadWorkspace(workspaceURI.toString(), undefined);
    } else {
      const file = workspace;
      if (electronApp.getCodeWindows().length > 0) {
        electronApp.getCodeWindows()[0].getBrowserWindow().focus();
        electronApp.getCodeWindows()[0].getBrowserWindow().webContents.send('openFile', file);
      } else {
        electronApp.loadWorkspace(undefined, { launchToOpenFile: file });
      }
    }
  }
}
