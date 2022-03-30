# OpenSumi IDE Electron

English | [中文文档](https://opensumi.com/zh/docs/integrate/quick-start/electron)

![OpenSumi Desktop](./snapshots/sumi-electron.png)

## Startup

```shell
git clone git@github.com:opensumi/ide-electron.git
cd ide-electron
npm install
npm run build
npm run rebuild-native -- --force-rebuild=true
npm run download-extension # install extension (Optional)
npm run start
```

## Develop

Start application:
```shell
npm run watch
npm run start
```

When there are new changes in the code, open the command panel in the editor <kbd>shift</kbd>+<kbd>command</kbd>+<kbd>p</kbd>, select and run the 'Reload Window' to reload the current editor window.

## package to DMG

package the project, and the installation package in the `out` directory:
```shell
npm run pack
```
