# OpenSumi IDE Electron 集成示例

![OpenSumi Desktop](./snapshots/sumi-electron.png)

## 快速开始

```shell
git clone git@github.com:opensumi/ide-electron.git
cd ide-electron
yarn
yarn run build
yarn run rebuild-native -- --force-rebuild=true
yarn run download-extension # 可选
yarn run start
```

## 开发

在根目录执行 `watch`。

```bash
yarn run watch
```

打开终端，运行：

```bash
yarn run start
```

当代码有新改动时，通过快捷键 <kbd>shift</kbd>+<kbd>command</kbd>+<kbd>p</kbd> 打开编辑器内的命令面板，选择并运行 `Reload Window` 命令即可重新加载当前编辑器窗口。

## 打包成 DMG

运行 `yarn run pack` 即可将项目打包，打包后的安装包将输出在 `out` 目录。
