import { Autowired, Injectable, Injector, INJECTOR_TOKEN } from '@opensumi/di';
import { ElectronMainModule } from '@opensumi/ide-core-electron-main/lib/electron-main-module';
import { IHelloService, IMainStorageService } from '../../common/types';
import { HelloContribution, HelloService } from './hello';
import { MainStorageContribution, MainStorageService } from './storage';

@Injectable()
export class MainModule extends ElectronMainModule {
  providers = [
    {
      token: IHelloService,
      useClass: HelloService,
    },
    HelloContribution,
    {
      token: IMainStorageService,
      useClass: MainStorageService,
    },
    MainStorageContribution,
  ];
}
