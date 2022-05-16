import { extProcessInit } from '@opensumi/ide-extension/lib/hosted/ext.process-base.js';
import { ExtensionCommands } from 'common/constants';
import { openNodeDevtool } from 'common/node/utils';

(async () => {
  await extProcessInit({
    builtinCommands: [
      {
        id: ExtensionCommands.OPEN_DEVTOOLS,
        handler: {
          handler: () => {
            openNodeDevtool();
          },
        },
      },
    ],
  });
})();
