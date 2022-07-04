import * as net from 'net';
import * as yargs from 'yargs';
import path from 'path';
import { homedir } from 'os';
import { Deferred } from '@opensumi/ide-core-common';
import { IServerAppOpts, ServerApp } from '@opensumi/ide-core-node';
import { Constants } from '../common/constants';

declare const SERVER_APP_OPTS: Record<string, unknown> & {
  marketplace: Record<string, unknown>;
};

function getDefinedServerOpts() {
  try {
    return SERVER_APP_OPTS;
  } catch {
    return {
      marketplace: {},
    };
  }
}

function getDataFolder(sub: string) {
  return path.join(homedir(), Constants.DATA_FOLDER, sub);
}

function getServerAppOpts() {
  let opts: IServerAppOpts = {
    webSocketHandler: [],
    marketplace: {
      showBuiltinExtensions: true,
      extensionDir: getDataFolder('extensions'),
    },
    logDir: getDataFolder('logs'),
  };
  try {
    const newOpts = getDefinedServerOpts();

    opts = {
      ...opts,
      ...newOpts,
      marketplace: {
        showBuiltinExtensions: true,
        ...newOpts.marketplace,
        ...opts.marketplace,
      },
    };
  } catch (error) {}
  return opts;
}

export async function startServer(_opts: Partial<IServerAppOpts>) {
  const deferred = new Deferred<net.Server>();
  let opts: IServerAppOpts = getServerAppOpts();

  opts = {
    ...opts,
    ..._opts,
  };

  const server = net.createServer();
  const listenPath = (await yargs.argv).listenPath;
  console.log('listenPath', listenPath);

  const serverApp = new ServerApp(opts);

  await serverApp.start(server);

  server.on('error', (err) => {
    deferred.reject(err);
    console.error('server error: ' + err.message);
    setTimeout(process.exit, 0, 1);
  });

  server.listen(listenPath, () => {
    console.log(`server listen on path ${listenPath}`);
    deferred.resolve(server);
  });

  await deferred.promise;
}
