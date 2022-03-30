import { BrowserModule } from '@opensumi/ide-core-browser';
import { Injectable } from '@opensumi/di';

import { ProjectSwitcherContribution } from './project';
import { MainCommandContribution } from './commands';
import { Constants } from '../common/constants';

@Injectable()
export class MiniDesktopModule extends BrowserModule {
  providers = [MainCommandContribution, ProjectSwitcherContribution];

  backServices = [
    {
      servicePath: Constants.ELECTRON_NODE_SERVICE_PATH,
    },
  ];
}
