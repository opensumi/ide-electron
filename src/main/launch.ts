import os from 'os';
import { join } from 'path';
import { app } from 'electron';
import { existsSync, statSync, ensureDir } from 'fs-extra';
import { ElectronMainApp } from '@opensumi/ide-core-electron-main';
import { isOSX, URI } from '@opensumi/ide-core-common';
import { MainModule } from './services';
import { OpenSumiDesktopMainModule } from './module';
import { WebviewElectronMainModule } from '@opensumi/ide-webview/lib/electron-main';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { Injector } from '@opensumi/di';
import { IMainStorageService } from 'common/types';
import { MainStorageService } from './services/storage';
import { Constants } from 'common/constants';

const getResourcesPath = () => {
  const appPath = app.getAppPath();
  if (appPath.indexOf('app.asar') > -1) {
    return join(appPath, '..');
  }
  return appPath;
};
export interface ThemeData {
  menuBarBackground?: string;
  sideBarBackground?: string;
  editorBackground?: string;
  panelBackground?: string;
  statusBarBackground?: string;
}

const getExtensionDir = () => join(getResourcesPath(), 'extensions');
const getUserExtensionDir = () => join(join(os.homedir(), Constants.DATA_FOLDER), 'extensions');

if (isOSX) {
  process.env.MAC_RESOURCES_PATH = getResourcesPath();
  console.log('MAC_RESOURCES_PATH', process.env.MAC_RESOURCES_PATH);
}

const injector = new Injector([
  {
    token: IMainStorageService,
    useClass: MainStorageService,
  },
]);
const storage: IMainStorageService = injector.get(IMainStorageService);
const themeData: ThemeData = storage.getItemSync('theme');

async function init() {
  const electronApp: ElectronMainApp = new ElectronMainApp({
    injector,
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
    overrideBrowserOptions: {
      backgroundColor: themeData?.editorBackground || Constants.DEFAULT_BACKGROUND,
      trafficLightPosition: { x: 9, y: 6 },
    },
    overrideWebPreferences: {},
  });
  await Promise.all([ensureDir(getExtensionDir()), ensureDir(getUserExtensionDir())]);
  return electronApp;
}

const initPromise = init();

export async function launch(workspace?: string) {
  console.log('workspace', workspace);

  const electronApp = await initPromise;
  await Promise.all([electronApp.init(), app.whenReady()]);

  if (process.env.OPENSUMI_DEVTOOLS === 'true') {
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: { allowFileAccess: true },
      forceDownload: true,
    })
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.error('An error occurred: ', err));
  }

  const codeWindows = electronApp.getCodeWindows();

  if (!workspace || !existsSync(workspace)) {
    if (codeWindows[1]) {
      return codeWindows[1].getBrowserWindow().show();
    }

    electronApp.loadWorkspace(undefined, undefined);
    return;
  }

  const workspaceStat = statSync(workspace);
  if (workspaceStat.isDirectory()) {
    const workspaceURI = URI.file(workspace);

    for (const window of codeWindows) {
      if (window.workspace?.isEqual(workspaceURI)) {
        return window.getBrowserWindow().show();
      }
    }

    electronApp.loadWorkspace(workspaceURI.toString(), undefined);
    return;
  }

  if (codeWindows.length) {
    codeWindows[0].getBrowserWindow().focus();
    codeWindows[0].getBrowserWindow().webContents.send('openFile', workspace);
    return;
  }

  electronApp.loadWorkspace(undefined, { launchToOpenFile: workspace });
}
