import { Autowired } from '@opensumi/di';
import { ClientAppContribution } from '@opensumi/ide-core-browser/lib/common';
import { Domain, IEventBus, ThrottledDelayer } from '@opensumi/ide-core-common';
import { ThemeChangedEvent } from '@opensumi/ide-theme/lib/common';
import { IMainStorageService } from 'common/types';

export interface ThemeData {
  menuBarBackground?: string;
  sideBarBackground?: string;
  editorBackground?: string;
  panelBackground?: string;
  statusBarBackground?: string;
}

const THEME_TIMEOUT = 1000;

@Domain(ClientAppContribution)
export class LocalThemeContribution implements ClientAppContribution {
  @Autowired(IMainStorageService)
  private readonly mainStorageService: IMainStorageService;

  @Autowired(IEventBus)
  private readonly eventBus: IEventBus;

  private trigger = new ThrottledDelayer(THEME_TIMEOUT);

  initialize() {
    this.updateTheme();

    this.eventBus.on(ThemeChangedEvent, () => {
      // e.payload.theme 数据有误
      // const theme = e.payload.theme;
      this.trigger.trigger(async () => {
        this.updateTheme();
      });
    });
  }

  async updateTheme() {
    const theme = localStorage.getItem('theme');
    if (!theme) {
      return;
    }
    let mainThemeData: ThemeData | null = null;
    try {
      mainThemeData = await this.mainStorageService.getItem('theme');
    } catch (error) {
      console.error('error:', error);
    }

    try {
      const themeObj = JSON.parse(theme);

      if (themeObj.editorBackground && mainThemeData && mainThemeData.editorBackground !== themeObj.editorBackground) {
        this.mainStorageService.setItem('theme', {
          menuBarBackground: themeObj.menuBarBackground,
          sideBarBackground: themeObj.sideBarBackground,
          editorBackground: themeObj.editorBackground,
          panelBackground: themeObj.panelBackground,
          statusBarBackground: themeObj.statusBarBackground,
        });
      }
    } catch (e) {
      // do nothing
    }
  }
}
