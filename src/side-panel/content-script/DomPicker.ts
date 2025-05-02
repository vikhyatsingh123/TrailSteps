import { ElementPicker } from 'js-element-picker';

class DomPicker {
	private instance: ElementPicker | null = null;

	cancel = (): void => {
		void this.instance?.stopPicking();
		this.instance = null;
	};

	clickHandler = (event: any): string => {
		let target = event.target,
			part = [],
			prev = target;
		const breadcrumb = [];

		while (target) {
			if (prev) {
				part.unshift(prev.tagName);
				prev = prev.previousElementSibling;
			} else {
				target = target.parentElement;
				prev = target;
				breadcrumb.unshift(part.join(' + '));
				part = [];
			}
		}

		return breadcrumb.join(' > ').toString();
	};

	pick = (): Promise<{ target: Element; event: MouseEvent; breadcrumb: string }> => {
		return new Promise((resolve) => {
			this.instance = new ElementPicker({
				picking: true,
				overlayDrawer: () => {
					const overlay = document.createElement('div');
					overlay.style.border = '3px solid #F05D3E';
					overlay.style.width = '100%';
					overlay.style.height = '96%';
					overlay.style.borderRadius = '8px';
					overlay.style.marginLeft = '-2px';
					return overlay;
				},
				onClick: (target, event) => {
					const breadcrumb = this.clickHandler(event);
					resolve({ target, event, breadcrumb });
					this.cancel();
				},
			});
		});
	};
}

export default DomPicker;
