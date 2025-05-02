import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				sidepanel: resolve(__dirname, 'index.html'),
				pdf: resolve(__dirname, 'public/pdf.html'),
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
