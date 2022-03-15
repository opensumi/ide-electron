import { BrowserModule } from '@opensumi/ide-core-browser';
import { Injectable } from '@opensumi/di';

import { ProjectSwitcherContribution } from './project';
import { MainCommandContribution } from './commands';
import { OpenSumiDesktopContribution } from './debug';

@Injectable()
export class MiniDesktopModule extends BrowserModule {
  providers = [MainCommandContribution, ProjectSwitcherContribution, OpenSumiDesktopContribution];

  backServices = [
    {
      servicePath: 'opensumi-electron-node',
    },
  ];
}
