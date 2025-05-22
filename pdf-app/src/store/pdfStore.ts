import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

export interface IPdfDataToStore {
	name?: string;
	subtitle?: string;
	description?: string;
	createdBy?: {
		name?: string;
		id?: string;
	};
	createdAt?: string;
	steps: IPdfStep[] | [];
}

export interface IPdfImage {
	id: string;
	imageUrl: string;
	content?: object;
	type?: string;
	selected?: boolean;
	uploading?: boolean;
	progress?: number;
}

export interface IPdfStep {
	title: string;
	description: string;
	url: string | null;
	screenshot?: string | null;
	index: number;
	id: string;
	notes: string | null;
	tooltip: string | null;
	stepImages?: IPdfImage[] | null;
	imageIds?: string[] | null;
	imageProperties?: Record<string, { orgImg: string; annotations: any[] }> | null;
}

const initialPdfData: IPdfDataToStore = {
	name: '',
	subtitle: '',
	description: '',
	createdBy: {
		name: '',
		id: '',
	},
	createdAt: '',
	steps: [
		{
			title: '',
			description: '',
			url: null,
			screenshot: null,
			id: crypto.randomUUID(),
			index: 0,
			notes: null,
			tooltip: null,
			stepImages: [],
			imageIds: [],
			imageProperties: {},
		},
	],
};

interface IAction {
	setPdfData: (pdfData: IPdfDataToStore) => void;
	setShowPdfPreview: (show: boolean) => void;
	setCurrentStep: (step: number) => void;
}

interface IStore {
	pdfData: IPdfDataToStore | null;
	showPdfPreview: boolean;
	currentStep: number;
	actions: IAction;
}

export const usePdfStore = create<IStore>()((set) => ({
	pdfData: null,
	showPdfPreview: false,
	currentStep: 0,
	actions: {
		setPdfData: (data) => {
			set({ pdfData: data });
		},
		setShowPdfPreview: (show) => {
			set({ showPdfPreview: show });
		},
		setCurrentStep: (step) => {
			set({ currentStep: step });
		},
	},
}));

export const usePdfData = (): IStore['pdfData'] => usePdfStore((state) => state.pdfData);
export const useCurrentStep = (): IStore['currentStep'] => usePdfStore((state) => state.currentStep);
export const useShowPdfPreview = (): IStore['showPdfPreview'] => usePdfStore((state) => state.showPdfPreview);
export const usePdfActions = (): IAction => usePdfStore(useShallow((state) => state.actions));
