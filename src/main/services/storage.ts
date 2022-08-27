import os from 'os';
import { Injector, Injectable, Autowired, INJECTOR_TOKEN } from '@opensumi/di';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { Emitter, Event } from '@opensumi/ide-utils/lib/event';
import fse, { ensureDir, ensureDirSync } from 'fs-extra';
import { IMainStorageService } from 'common/types';
import { Constants } from 'common/constants';
import { Domain } from '@opensumi/ide-core-common';
import {
  ElectronMainApiRegistry,
  ElectronMainContribution,
} from '@opensumi/ide-core-electron-main/lib/bootstrap/types';

export interface StorageChange {
  path: string;
  data: string;
}

const STORAGE_DIR_NAME = '';

@Injectable()
export class MainStorageService implements IMainStorageService {
  public storageDirUri: URI | undefined;

  public homeDir = os.homedir();

  public _cache: any = {};

  public onDidChangeEmitter = new Emitter<StorageChange>();

  readonly onDidChange: Event<StorageChange> = this.onDidChangeEmitter.event;

  constructor() {
    this.storageDirUri = URI.file(this.homeDir).resolve(Constants.DATA_FOLDER).resolve(STORAGE_DIR_NAME);
  }

  setRootStoragePath(storagePath: string) {
    if (!storagePath) {
      throw new Error('Set Storage path fail, storagePath is incorrect.');
    }
    this.storageDirUri = URI.file(storagePath);
  }

  async getStoragePath(storageName: string): Promise<string> {
    if (!this.storageDirUri) {
      throw new Error('No storageDirUri');
    }

    await ensureDir(this.storageDirUri.codeUri.fsPath);

    return this.storageDirUri.resolve(`${storageName}.json`).codeUri.fsPath;
  }

  getStoragePathSync(storageName: string): string {
    if (!this.storageDirUri) {
      throw new Error('No storageDirUri');
    }

    ensureDirSync(this.storageDirUri.codeUri.fsPath);

    return this.storageDirUri.resolve(`${storageName}.json`).codeUri.fsPath;
  }

  async getItem(storageName: string): Promise<any> {
    if (this._cache[storageName]) {
      return this._cache[storageName];
    }

    let data = {};
    const storagePath = await this.getStoragePath(storageName);
    try {
      await fse.access(storagePath);
    } catch (error) {
      console.error(`Storage [${storageName}] is invalid.`);
      return data;
    }

    const content = await fse.readFile(storagePath);
    try {
      data = JSON.parse(content.toString());
    } catch (error) {
      console.error(`Parse item ${storagePath}: ${content.toString()} fail:`, error);
      return data;
    }

    this._cache[storageName] = data;
    return data;
  }

  getItemSync(storageName: string): any {
    if (this._cache[storageName]) {
      return this._cache[storageName];
    }

    let data = {};
    const storagePath = this.getStoragePathSync(storageName);
    try {
      fse.accessSync(storagePath);
    } catch (error) {
      console.error(`Storage [${storageName}] is invalid.`);
      return data;
    }

    const content = fse.readFileSync(storagePath);
    try {
      data = JSON.parse(content.toString());
    } catch (error) {
      console.error(`Parse item ${storagePath}: ${content.toString()} fail:`, error);
      return data;
    }

    this._cache[storageName] = data;
    return data;
  }

  async setItem(storageName: string, value: any) {
    this._cache[storageName] = value;
    let storagePath: string;
    try {
      storagePath = await this.getStoragePath(storageName);
    } catch (error) {
      console.error(`Storage [${storageName}] is invalid. ${error.message}`);
      return;
    }

    if (!value) {
      console.error('Trying to setItem null, Not allowed.');
      return;
    }

    await fse.writeFile(storagePath, JSON.stringify(value)).catch((error) => {
      console.error(`${storagePath} write data fail: ${error.stack}`);
    });

    const change: StorageChange = {
      path: URI.parse(storagePath).toString(),
      data: value,
    };
    this.onDidChangeEmitter.fire(change);
  }
}

@Domain(ElectronMainContribution)
export class MainStorageContribution implements ElectronMainContribution {
  @Autowired(INJECTOR_TOKEN)
  injector: Injector;

  registerMainApi(registry: ElectronMainApiRegistry) {
    registry.registerMainApi(IMainStorageService, this.injector.get(IMainStorageService));
  }
}
