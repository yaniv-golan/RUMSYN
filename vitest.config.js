import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['tests/unit/**/*.test.js'],reporters:['default','json'],outputFile:{json:'artifacts/unit-report.json'}}});
