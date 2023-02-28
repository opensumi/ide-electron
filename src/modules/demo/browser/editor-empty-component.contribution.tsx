import React from 'react';
import { useState, useEffect, FC, useMemo } from 'react';
import {
  Domain,
  ComponentContribution,
  ComponentRegistry,
  EDITOR_COMMANDS,
  SEARCH_COMMANDS,
  QUICK_OPEN_COMMANDS,
} from '@opensumi/ide-core-browser';
import { Keybinding, KeybindingRegistry } from '@opensumi/ide-core-browser/lib/keybinding/keybinding';
import { useInjectable } from '@opensumi/ide-core-browser/lib/react-hooks';
import { KeybindingView } from '@opensumi/ide-quick-open/lib/browser/components/keybinding';
import { localize } from '@opensumi/ide-core-common';
import { IKeymapService } from '@opensumi/ide-keymaps/lib/common/keymaps';

import styles from './editor-empty-component.module.less';

/**
 * 单行快捷键信息
 * @param param0
 * @returns
 */
const ShortcutRow: FC<{
  key: string;
  label: string;
  keybinding: Keybinding;
}> = ({ key, label, keybinding }) => (
  <dl className={styles.shortcutRow} key={key}>
    <span className={styles.label}>{label}</span>
    <KeybindingView keybinding={keybinding} className={styles.keybinding} />
  </dl>
);

/**
 * 编辑器空白页引导信息
 */
export const EditorEmptyComponent = () => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [keyMapLoaded, setKeyMapLoaded] = useState(false);

  const keybindingRegistry = useInjectable<KeybindingRegistry>(KeybindingRegistry);
  const keymapService = useInjectable<IKeymapService>(IKeymapService);

  const getKeybinding = (commandId: string) => {
    const bindings = keybindingRegistry.getKeybindingsForCommand(commandId);
    if (!bindings.length) {
      return;
    }

    const keyBindings = bindings.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    // 如果快捷键条目没有 when 条件，优先使用
    const primaryKeybinding = bindings.find((binding) => !binding.when);
    return primaryKeybinding || keyBindings[0];
  };

  useEffect(() => {
    // 监听快捷键是否有更新
    keymapService.whenReady.then(() => {
      setKeyMapLoaded(true);
    });
  }, []);

  const ShortcutView = useMemo(() => {
    if (!imgLoaded || !keyMapLoaded) {
      return;
    }

    const keyInfos = [
      {
        label: localize('custom.quick_open'),
        command: EDITOR_COMMANDS.QUICK_OPEN.id,
        keybinding: getKeybinding(EDITOR_COMMANDS.QUICK_OPEN.id),
      },
      {
        label: localize('custom.command_palette'),
        command: QUICK_OPEN_COMMANDS.OPEN.id,
        keybinding: getKeybinding(QUICK_OPEN_COMMANDS.OPEN.id),
      },
      {
        label: localize('custom.terminal_panel'),
        command: 'workbench.view.terminal',
        keybinding: getKeybinding('workbench.view.terminal'),
      },
      {
        label: localize('custom.search_panel'),
        command: SEARCH_COMMANDS.OPEN_SEARCH.id,
        keybinding: getKeybinding(SEARCH_COMMANDS.OPEN_SEARCH.id),
      },
    ].filter((e) => e.keybinding);
    return (
      <div className={styles.shortcutPanel}>
        {keyInfos.map((keyInfo) => (
          <ShortcutRow
            key={keyInfo.command}
            label={keyInfo.label}
            keybinding={keyInfo.keybinding as Keybinding}
          ></ShortcutRow>
        ))}
      </div>
    );
  }, [imgLoaded, keyMapLoaded]);

  const logoUri = 'https://img.alicdn.com/imgextra/i2/O1CN01dqjQei1tpbj9z9VPH_!!6000000005951-55-tps-87-78.svg';
  return (
    <div className={styles.empty_component}>
      <img src={logoUri} onLoad={() => setImgLoaded(true)} />
      {ShortcutView}
    </div>
  );
};

@Domain(ComponentContribution)
export class EditorEmptyComponentContribution implements ComponentContribution {
  registerComponent(registry: ComponentRegistry) {
    registry.register('editor-empty', {
      id: 'empty-component',
      component: EditorEmptyComponent,
      initialProps: {},
    });
  }
}
