import { Injectable } from '@opensumi/di';
import { createElectronMainApi } from '@opensumi/ide-core-browser';
import { ElectronBasicModule } from '@opensumi/ide-electron-basic/lib/browser';
import { IMainStorageService } from 'common/types';
import { LocalMenuContribution } from './menu.contribution';
import { LocalThemeContribution } from './theme.contribution';

@Injectable()
export class LocalBasicModule extends ElectronBasicModule {
  providers = [
    LocalMenuContribution,
    LocalThemeContribution,
    {
      token: IMainStorageService,
      useValue: createElectronMainApi(IMainStorageService),
    },
  ];
}
