import { NodeModule, INodeLogger } from '@opensumi/ide-core-node';
import { openNodeDevtool } from '../common/node/utils';
import { Autowired, Injectable } from '@opensumi/di';
import { Constants } from '../common/constants';

import * as fs from 'fs';
import { exists, symlink, unlink } from 'fs';

import { promisify } from 'util';
import { exec } from 'child_process';
import { lstat, realpath, stat } from 'fs-extra';

const existsAsync = promisify(exists);
const unlinkAsync = promisify(unlink);
const symlinkAsync = promisify(symlink);
/**
 * Resolves the `fs.Stats` of the provided path. If the path is a
 * symbolic link, the `fs.Stats` will be from the target it points
 * to. If the target does not exist, `dangling: true` will be returned
 * as `symbolicLink` value.
 */
export async function symStat(path: string): Promise<any> {
  // First stat the link
  let lstats: fs.Stats | undefined;
  try {
    lstats = await lstat(path);

    // Return early if the stat is not a symbolic link at all
    if (!lstats.isSymbolicLink()) {
      return { stat: lstats };
    }
  } catch (error) {
    /* ignore - use stat() instead */
  }

  // If the stat is a symbolic link or failed to stat, use fs.stat()
  // which for symbolic links will stat the target they point to
  try {
    const stats = await stat(path);

    return { stat: stats, symbolicLink: lstats && lstats.isSymbolicLink() ? { dangling: false } : undefined };
  } catch (error) {
    // If the link points to a nonexistent file we still want
    // to return it as result while setting dangling: true flag
    if (error.code === 'ENOENT' && lstats) {
      return { stat: lstats, symbolicLink: { dangling: true } };
    }

    throw error;
  }
}

@Injectable()
export class OpenSumiNodeService {
  @Autowired(INodeLogger)
  logger: INodeLogger;

  debugNode() {
    openNodeDevtool();
  }

  async installShellCommand(): Promise<void> {
    try {
      await this._installShellCommand();
    } catch (error) {
      this.logger.error('_installShellCommand', error);
    }
  }

  async _installShellCommand(): Promise<void> {
    const { source, target } = await this.getShellCommandLink();

    // Only install unless already existing
    try {
      const { symbolicLink } = await symStat(source);
      if (symbolicLink && !symbolicLink.dangling) {
        const linkTargetRealPath = await realpath(source);
        if (target === linkTargetRealPath) {
          return;
        }
      }
      this.logger.error('source', source);

      // Different source, delete it first
      await unlinkAsync(source);
    } catch (error) {
      this.logger.error('error,', error);
      if (error.code !== 'ENOENT') {
        throw error; // throw on any error but file not found
      }
    }

    try {
      await symlinkAsync(target, source);
    } catch (error) {
      if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
        throw error;
      }

      try {
        const command = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'${target}\' \'${source}\'\\" with administrator privileges"`;
        await promisify(exec)(command);
      } catch (error) {
        throw new Error(`Unable to install the shell command ${source}`);
      }
    }
  }

  async uninstallShellCommand(): Promise<void> {
    const { source } = await this.getShellCommandLink();

    try {
      await unlinkAsync(source);
    } catch (error) {
      switch (error.code) {
        case 'EACCES': {
          try {
            const command = `osascript -e "do shell script \\"rm \'${source}\'\\" with administrator privileges"`;
            await promisify(exec)(command);
          } catch (error) {
            throw new Error(`Unable to uninstall the shell command ${source}`);
          }
          break;
        }
        case 'ENOENT':
          break; // ignore file not found
        default:
          throw error;
      }
    }
  }

  private async getShellCommandLink(): Promise<{ readonly source: string; readonly target: string }> {
    const target = `${process.env.MAC_RESOURCES_PATH}/resources/darwin/bin/sumi`;
    const source = '/usr/local/bin/sumi';

    // Ensure source exists
    const sourceExists = await existsAsync(target);
    if (!sourceExists) {
      throw new Error(`Unable to find shell script in ${target}`);
    }

    return { source, target };
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
