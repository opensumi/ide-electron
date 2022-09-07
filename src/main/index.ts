import path from 'path';
import { app } from 'electron';
import { launch } from './launch';
import minimist from 'minimist';
import { existsSync } from 'fs-extra';

const launchFromCommandLine = (processArgv: string[], workingDirectory: string): Promise<void> => {
  console.log('processArgv', processArgv);

  const parsedArgs = minimist(processArgv);
  const _argv = parsedArgs['_'].map((arg) => String(arg)).filter((arg) => arg.length > 0);
  const [, , ...argv] = _argv; // remove the first non-option argument: it's always the app location

  console.log('🚀 ~ file: index.ts ~ line 17 ~ launchFromCommandLine ~ argv', argv);
  console.log('working directory', workingDirectory);

  if (argv.length === 0) {
    return launch();
  }

  try {
    const argvPath = path.resolve(argv[0]);
    const exists = existsSync(argvPath);
    if (exists) {
      return launch(argvPath);
    }

    const workspace = path.resolve(workingDirectory, argv[0]);
    return launch(workspace);
  } catch (e) {
    console.error('parse argv error', e);
    return launch();
  }
};

const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  launchFromCommandLine(commandLine, workingDirectory).catch(console.error);
});

launchFromCommandLine(process.argv, process.cwd()).catch(console.error);
