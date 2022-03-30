import { Injectable } from '@opensumi/di';
import { ElectronBasicModule } from '@opensumi/ide-electron-basic/lib/browser';
import { LocalMenuContribution } from './menu.contribution';

@Injectable()
export class LocalBasicModule extends ElectronBasicModule {

  providers = [
    LocalMenuContribution,
  ]

}
