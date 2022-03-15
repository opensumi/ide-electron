import { extProcessInit } from '@opensumi/ide-extension/lib/hosted/ext.process-base.js';
import { openNodeDevtool } from '/common/node/utils';

(async () => {
  await extProcessInit({
    builtinCommands: [
      {
        id: 'opensumi.help.openDevtools.extension',
        handler: {
          handler: () => {
            openNodeDevtool();
          },
        },
      },
    ],
  });
})();
