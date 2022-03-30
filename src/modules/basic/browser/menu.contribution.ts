import { IMenuRegistry, MenuId } from "@opensumi/ide-core-browser/lib/menu/next";
import { localize } from "@opensumi/ide-core-common/lib/localize";
import { ElectronBasicContribution } from "@opensumi/ide-electron-basic/lib/browser";

export class LocalMenuContribution extends ElectronBasicContribution {

  registerMenus(menuRegistry: IMenuRegistry) {
    menuRegistry.registerMenuItem(MenuId.MenubarAppMenu, {
      submenu: MenuId.SettingsIconMenu,
      label: localize('common.preferences'),
      group: '2_preference',
    });
  }

}