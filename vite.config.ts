import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
	plugins: [solidPlugin()],
	publicDir: 'static',
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	},
	build: {
		target: 'esnext'
	}
});
