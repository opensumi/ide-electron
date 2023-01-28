import { IClientAppOpts, electronEnv, URI } from '@opensumi/ide-core-browser';
import { Injector } from '@opensumi/di';
import { ClientApp } from '@opensumi/ide-core-browser/lib/bootstrap/app';
import { createSocketConnection } from '@opensumi/ide-connection/lib/node';

// 引入公共样式文件
import '@opensumi/ide-core-browser/lib/style/index.less';
// 引入本地icon，不使用cdn版本，与useCdnIcon配套使用
import '@opensumi/ide-core-browser/lib/style/icon.less';
import { IElectronMainLifeCycleService } from '@opensumi/ide-core-common/lib/electron';
import { Constants } from 'common/constants';
import 'common/i18n/setup';

export async function renderApp(opts: IClientAppOpts) {
  const injector = new Injector();

  opts.workspaceDir = electronEnv.env.WORKSPACE_DIR;
  opts.extensionDir = electronEnv.metadata.extensionDir;
  opts.injector = injector;

  opts.preferenceDirName = Constants.DATA_FOLDER;
  opts.storageDirName = Constants.DATA_FOLDER;
  opts.extensionStorageDirName = Constants.DATA_FOLDER;

  if (electronEnv.metadata.workerHostEntry) {
    opts.extWorkerHost = URI.file(electronEnv.metadata.workerHostEntry).toString();
  }
  opts.didRendered = () => {
    const loadingDom = document.getElementById('loading');
    if (loadingDom) {
      loadingDom.classList.add('loading-hidden');
      loadingDom.remove();
    }
  };

  const app = new ClientApp(opts);

  // 拦截reload行为
  app.fireOnReload = () => {
    injector.get(IElectronMainLifeCycleService).reloadWindow(electronEnv.currentWindowId);
  };

  const netConnection = await (window as any).createRPCNetConnection();
  app.start(document.getElementById('main')!, 'electron', createSocketConnection(netConnection));
}
