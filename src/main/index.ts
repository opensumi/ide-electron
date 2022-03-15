import path from 'path';
import { app } from 'electron';
import { launch } from './launch';

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    launchFromCommandLine(commandLine, workingDirectory);
  });
}

function launchFromCommandLine(argv: string[], workingDirectory: string) {
  console.log(argv);
  console.log('working directory', workingDirectory);
  if (argv[1]) {
    try {
      const workspace = path.resolve(workingDirectory, argv[1]);
      launch(workspace);
    } catch (e) {
      console.error(e);
      launch();
    }
  } else {
    launch();
  }
}

launchFromCommandLine(process.argv, process.cwd());
