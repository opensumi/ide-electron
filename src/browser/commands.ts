import {
  CommandContribution,
  Domain,
  CommandRegistry,
  ILogger,
  createElectronMainApi,
  memoize,
} from '@opensumi/ide-core-browser';
import { Autowired } from '@opensumi/di';
import { ExtensionService } from '@opensumi/ide-extension/lib/common';
import { Commands, Constants, ExtensionCommands } from '../common/constants';

@Domain(CommandContribution)
export class MainCommandContribution implements CommandContribution {
  @Autowired(ExtensionService)
  extensionService: ExtensionService;

  @Autowired(ILogger)
  logger: ILogger;

  @Autowired(Constants.ELECTRON_NODE_SERVICE_PATH)
  nodeService: any;

  _chars = 0;

  @memoize
  getMainApi(): any {
    return createElectronMainApi(Constants.ELECTRON_MAIN_API_NAME);
  }

  tryToJSON(obj: any) {
    try {
      return JSON.stringify(obj).substr(0, 5000);
    } catch (e) {
      return 'unable to JSON.stringify';
    }
  }

  registerCommands(commands: CommandRegistry): void {
    commands.beforeExecuteCommand((command: string, args: any[]) => {
      this.logger.log('execute_command', command, ...args.map((a) => this.tryToJSON(a)));
      return args;
    });

    commands.registerCommand(
      {
        id: Commands.OPEN_DEVTOOLS_MAIN,
        label: '调试主进程',
      },
      {
        execute: () => {
          this.getMainApi().debugMain();
        },
      },
    );

    commands.registerCommand(
      {
        id: Commands.OPEN_DEVTOOLS_NODE,
        label: '调试Node进程',
      },
      {
        execute: () => {
          this.nodeService.debugNode();
        },
      },
    );

    commands.registerCommand(
      {
        id: Commands.OPEN_DEVTOOLS_EXTENSION,
        label: '调试插件进程',
      },
      {
        execute: () => {
          (this.extensionService as any).extensionCommandManager.executeExtensionCommand(
            'node',
            ExtensionCommands.OPEN_DEVTOOLS,
            [],
          );
        },
      },
    );
    commands.registerCommand(
      {
        id: 'sumi.commandLineTool.install',
        label: 'install command line sumi',
      },
      {
        execute: async () => {
          this.nodeService.installShellCommand();
        },
      },
    );

    commands.registerCommand(
      {
        id: 'sumi.commandLineTool.uninstall',
        label: 'uninstall command line sumi',
      },
      {
        execute: async () => {
          this.nodeService.uninstallShellCommand();
        },
      },
    );
  }
}
