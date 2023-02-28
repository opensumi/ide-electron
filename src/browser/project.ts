import {
  Domain,
  CommandContribution,
  CommandRegistry,
  URI,
  electronEnv,
  ClientAppContribution,
  StorageProvider,
} from '@opensumi/ide-core-browser';
import { IMenuRegistry, MenuId, NextMenuContribution } from '@opensumi/ide-core-browser/lib/menu/next';
import { Autowired } from '@opensumi/di';
import { IWorkspaceService } from '@opensumi/ide-workspace/lib/common';
import { IWindowService, WORKSPACE_COMMANDS } from '@opensumi/ide-core-browser';
import { ITerminalController } from '@opensumi/ide-terminal-next';
import { IMainLayoutService } from '@opensumi/ide-main-layout';
import { BrowserEditorContribution, WorkbenchEditorService } from '@opensumi/ide-editor/lib/browser';
import { IThemeService } from '@opensumi/ide-theme';

@Domain(NextMenuContribution, CommandContribution, BrowserEditorContribution, ClientAppContribution)
export class ProjectSwitcherContribution
  implements NextMenuContribution, CommandContribution, BrowserEditorContribution, ClientAppContribution
{
  @Autowired(IWorkspaceService)
  workspaceService: IWorkspaceService;

  @Autowired(IWindowService)
  windowService: IWindowService;

  @Autowired(ITerminalController)
  terminalService: ITerminalController;

  @Autowired(WorkbenchEditorService)
  editorService: WorkbenchEditorService;

  @Autowired(IMainLayoutService)
  private mainLayoutService: IMainLayoutService;

  @Autowired(IThemeService)
  private themeService: IThemeService;

  @Autowired(StorageProvider)
  getStorage: StorageProvider;

  async onStart() {}

  registerCommands(registry: CommandRegistry) {
    this.workspaceService.getMostRecentlyUsedWorkspaces().then((workspaces) => {
      workspaces.forEach((workspace) => {
        registry.registerCommand(
          {
            id: 'open.recent.' + workspace,
          },
          {
            execute: () => {
              this.windowService.openWorkspace(new URI(workspace), {
                newWindow: true,
              });
            },
          },
        );
      });
    });
  }

  registerMenus(registry: IMenuRegistry) {
    registry.registerMenuItem(MenuId.MenubarFileMenu, {
      submenu: 'recentProjects',
      label: '最近项目',
      group: '1_open',
    });

    this.workspaceService.getMostRecentlyUsedWorkspaces().then((workspaces) => {
      registry.registerMenuItems(
        'recentProjects',
        workspaces.map((workspace) => ({
          command: {
            id: 'open.recent.' + workspace,
            label: new URI(workspace).codeUri.fsPath,
          },
        })),
      );
    });

    registry.registerMenuItems(MenuId.MenubarFileMenu, [
      {
        command: WORKSPACE_COMMANDS.ADD_WORKSPACE_FOLDER.id,
        label: '添加文件夹至工作区',
        group: '2_new',
      },
      {
        command: {
          id: WORKSPACE_COMMANDS.SAVE_WORKSPACE_AS_FILE.id,
          label: '保存工作区',
        },
        group: '3_save',
      },
    ]);
  }

  onDidRestoreState() {
    if (electronEnv.metadata.launchToOpenFile) {
      this.editorService.open(URI.file(electronEnv.metadata.launchToOpenFile));
    }
    electronEnv.ipcRenderer.on('openFile', (event, file) => {
      this.editorService.open(URI.file(file));
    });
  }
}
