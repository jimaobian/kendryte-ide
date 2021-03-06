import * as st from 'vs/workbench/parts/preferences/browser/settingsTree';
import * as stm from 'vs/workbench/parts/preferences/browser/settingsTreeModels';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { DynamicEnumInject } from 'vs/kendryte/vs/workbench/patchSettings2/browser/fieldTypes/dynamicEnum';
import { ButtonInject } from 'vs/kendryte/vs/workbench/patchSettings2/browser/fieldTypes/actionButton';
import { FieldInject } from 'vs/kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { FileInject } from 'vs/kendryte/vs/workbench/patchSettings2/browser/fieldTypes/fileSelect';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';

const OriginalClass = st.SettingsRenderer;

interface IDisposableTemplate {
	toDispose: IDisposable[];
}

class SettingsRendererPatch extends OriginalClass {
	protected injectors: FieldInject<any, any>[];

	constructor(
		_measureParent: HTMLElement,
		@IThemeService themeService: IThemeService,
		@IContextViewService contextViewService: IContextViewService,
		@IOpenerService openerService: IOpenerService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICommandService commandService: ICommandService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IKeybindingService keybindingService: IKeybindingService,
	) {
		super(
			_measureParent,
			themeService,
			contextViewService,
			openerService,
			instantiationService,
			commandService,
			contextMenuService,
			keybindingService,
		);
		this.injectors = [
			instantiationService.createInstance(DynamicEnumInject, this),
			instantiationService.createInstance(ButtonInject, this),
			instantiationService.createInstance(FileInject, this),
		];
	}

	getTemplateId(tree: ITree, element: stm.SettingsTreeElement): string {
		for (const item of this.injectors) {
			const id = item.detect(element);
			if (id) {
				return id;
			}
		}
		return super.getTemplateId(tree, element);
	}

	renderTemplate(tree: ITree, templateId: string, parent: HTMLElement): any {
		for (const item of this.injectors) {
			const template = item.template(tree, templateId, parent);
			if (template) {
				return template;
			}
		}
		return super.renderTemplate(tree, templateId, parent);
	}

	renderElement(tree: ITree, element: stm.SettingsTreeSettingElement, templateId: string, template: any): void {
		for (const item of this.injectors) {
			const hit = item.entry(tree, element, templateId, template);
			if (hit) {
				return;
			}
		}
		super.renderElement(tree, element, templateId, template);
	}

	disposeTemplate(tree: ITree, templateId: string, template: IDisposableTemplate): void {
		for (const item of this.injectors) {
			const hit = item.dispose(tree, templateId, template);
			if (hit) {
				return;
			}
		}
		return super.disposeTemplate(tree, templateId, template);
	}

	getHeight(tree: ITree, element: stm.SettingsTreeElement): number {
		return super.getHeight(tree, element);
	}
}

Object['assign'](st, {
	SettingsRenderer: SettingsRendererPatch,
});
