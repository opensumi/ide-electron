import {
  CommandContribution,
  Domain,
  CommandRegistry,
  ILogger,
  createElectronMainApi,
  memoize,
} from "@opensumi/ide-core-browser";
import { MonacoContribution } from "@opensumi/ide-monaco";
import { Autowired } from "@opensumi/di";
import * as monaco from "@opensumi/monaco-editor-core/esm/vs/editor/editor.api";
import { ExtensionService } from "@opensumi/ide-extension/lib/common";

@Domain(CommandContribution, MonacoContribution)
export class OpenSumiDesktopContribution
  implements CommandContribution, MonacoContribution
{
  @Autowired(ExtensionService)
  extensionService: ExtensionService;

  @Autowired(ILogger)
  logger: ILogger;

  @Autowired("opensumi-electron-node")
  nodeService: any;

  _chars = 0;

  @memoize
  getMainApi(): any {
    return createElectronMainApi("opensumi");
  }

  tryToJSON(obj: any) {
    try {
      return JSON.stringify(obj).substr(0, 5000);
    } catch (e) {
      return "unable to JSON.stringify";
    }
  }

  registerCommands(commands: CommandRegistry): void {
    commands.beforeExecuteCommand((command: string, args: any[]) => {
      this.logger.log(
        "execute_command",
        command,
        ...args.map((a) => this.tryToJSON(a))
      );
      return args;
    });

    commands.registerCommand(
      {
        id: "opensumi.help.openDevtools.main",
        label: "调试主进程",
      },
      {
        execute: () => {
          this.getMainApi().debugMain();
        },
      }
    );

    commands.registerCommand(
      {
        id: "opensumi.help.openDevtools.node",
        label: "调试Node进程",
      },
      {
        execute: () => {
          this.nodeService.debugNode();
        },
      }
    );

    commands.registerCommand(
      {
        id: "opensumi.help.openDevtools.extension",
        label: "调试插件进程",
      },
      {
        execute: () => {
          // this.extensionService.declareExtensionCommand('opensumi.help.openDevtools.extension', 'node');
          this.extensionService.executeExtensionCommand(
            "opensumi.help.openDevtools.extension",
            []
          );
        },
      }
    );
  }

  onMonacoLoaded() {
    this.initModelChangeReport();
  }

  initModelChangeReport() {
    monaco.editor.onDidCreateModel((m) => {
      if (m.uri.scheme === "file") {
        const uriString = m.uri.toString();
        m.onDidChangeContent((e) => {
          this.logger.log("modelChange", uriString, this.tryToJSON(e));
        });
      }
    });
  }
}
