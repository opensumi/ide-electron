import {
  ElectronMainApiProvider,
  ElectronMainApiRegistry,
  ElectronMainContribution,
  ElectronMainModule,
} from '@opensumi/ide-core-electron-main';
import { Domain } from '@opensumi/ide-core-common';
import { Injectable, Autowired } from '@opensumi/di';
import { openNodeDevtool } from '../common/node/utils';
import { Constants } from '../common/constants';

@Injectable()
export class OpenSumiDesktopMainModule extends ElectronMainModule {
  providers = [OpenSumiDesktopMainContribution];
}

@Injectable()
export class OpenSumiDesktopMainApi extends ElectronMainApiProvider<void> {
  debugMain() {
    openNodeDevtool();
  }
}

@Domain(ElectronMainContribution)
export class OpenSumiDesktopMainContribution implements ElectronMainContribution {
  @Autowired()
  api: OpenSumiDesktopMainApi;

  registerMainApi(registry: ElectronMainApiRegistry) {
    registry.registerMainApi(Constants.ELECTRON_MAIN_API_NAME, this.api);
  }
}
