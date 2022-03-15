import { NodeModule } from '@opensumi/ide-core-node';
import { openNodeDevtool } from '../common/node/utils';
import { Injectable } from '@opensumi/di';
import { Constants } from '/common/constants';

@Injectable()
export class OpenSumiNodeService {
  debugNode() {
    openNodeDevtool();
  }
}

@Injectable()
export class MiniCodeDesktopNodeModule extends NodeModule {
  providers = [
    {
      token: Constants.ELECTRON_NODE_SERVICE_NAME,
      useClass: OpenSumiNodeService,
    },
  ];

  backServices = [
    {
      servicePath: Constants.ELECTRON_NODE_SERVICE_PATH,
      token: Constants.ELECTRON_NODE_SERVICE_NAME,
    },
  ];
}
