import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [react(), dts()],
	build: {
		rollupOptions: {
			input: {
				panel: resolve(__dirname, 'public/panel.html'),
				background: resolve(__dirname, 'src/side-panel/service-worker/index.ts'),
				contentScript: resolve(__dirname, 'src/side-panel/content-script/index.ts'),
				pdf: resolve(__dirname, 'public/pdf.html'),
			},
			output: {
				entryFileNames: '[name].js',
			},
		},
		outDir: 'dist',
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	server: {
		port: 5000,
	},
});
