import { Autowired, Injector, INJECTOR_TOKEN } from '@opensumi/di';
import { electronEnv } from '@opensumi/ide-core-browser';
import { Domain, CommandContribution, CommandRegistry } from '@opensumi/ide-core-common';
import { IMainLayoutService } from '@opensumi/ide-main-layout';
import { ITerminalController } from '@opensumi/ide-terminal-next';

@Domain(CommandContribution)
export class MainCommandContribution implements CommandContribution {
  @Autowired(INJECTOR_TOKEN)
  injector: Injector;

  @Autowired(ITerminalController)
  terminalService: ITerminalController;

  @Autowired(IMainLayoutService)
  private mainLayoutService: IMainLayoutService;

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(
      {
        id: 'sumi.commandLineTool.install',
        label: 'install command line sumi',
      },
      {
        execute: async () => {
          if (this.terminalService.clients.size === 0) {
            await this.terminalService.createClientWithWidget2({
              terminalOptions: {
                name: 'install sumi',
                cwd: '/usr/local/bin',
              },
            });
          }

          const handler = this.mainLayoutService.getTabbarHandler('terminal');
          if (handler) {
            handler.activate();
          }
          const binPath = `${electronEnv.env.MAC_RESOURCES_PATH}/resources/darwin/bin/sumi`;
          const command = `cd /usr/local/bin && ln -sf '${binPath}' && chmod +x ./sumi\n`;

          for (const c of this.terminalService.clients.values()) {
            if (c) {
              c.sendText(command);
              return;
            }
          }
        },
      },
    );
  }
}
