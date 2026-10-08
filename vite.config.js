import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',build:{rolldownOptions:{input:{app:fileURLToPath(new URL('./apps/web/index.html',import.meta.url)),proof:fileURLToPath(new URL('./apps/web/proof.html',import.meta.url))}}}});
