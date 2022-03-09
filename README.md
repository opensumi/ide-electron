# OpenSumi IDE Electron 集成示例

![OpenSumi Desktop](./snapshots/sumi-electron.png)

## 快速开始

```shell
git clone git@github.com:opensumi/ide-electron.git
cd ide-electron
npm install
npm run build
npm run rebuild-native -- --force-rebuild=true
npm run download-extension # 可选
npm run start
```

## 开发

在项目根目录运行

```bash
npm run watch
```

打开终端，运行：

```bash
npm run start
```

当代码有新改动时，通过快捷键 <kbd>shift</kbd>+<kbd>command</kbd>+<kbd>p</kbd> 打开编辑器内的命令面板，选择并运行 `Reload Window` 命令即可重新加载当前编辑器窗口。

## 打包成 DMG

运行 `npm run pack` 即可将项目打包，打包后的安装包将输出在 `out` 目录。
