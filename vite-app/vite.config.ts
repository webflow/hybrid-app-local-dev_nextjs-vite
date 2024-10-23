import react from '@vitejs/plugin-react';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const wfDesignerExtensionPlugin = (watchPatterns: string[] = []): Plugin => {
  let webflowHTML = '';
  const configPath = path.join('./webflow.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const webflowConfig = JSON.parse(configContent);

  return {
    name: 'wf-vite-combined-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler: async (html: string, ctx) => {
        if (ctx.server) {
          // Development mode
          console.log('\x1b[36m%s\x1b[0m', 'Development mode');
          if (!webflowHTML) {
            const { name, apiVersion, featureFlags } = webflowConfig;
            const template = apiVersion === '2' ? '/template/v2' : '/template';
            const flagQuery = buildFlagQuery(featureFlags);
            const url = `https://webflow-ext.com${template}?name=${name}${flagQuery}`;
            webflowHTML = await fetch(url).then((res) => res.text());
          }

          // Extract script tags from webflowHTML
          const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
          let match;
          let scripts = '';
          while ((match = scriptRegex.exec(webflowHTML)) !== null) {
            scripts += match[0] + '\n';
          }

          // Insert extracted scripts at the end of the head tag
          const finalHTML = html.replace('</head>', `${scripts}</head>`);
          return finalHTML;
        }
      },
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/__webflow') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
          });
          res.end(configContent);
        } else {
          next();
        }
      });

      // Watch for changes in specified patterns
      const watcher = chokidar.watch(watchPatterns, {
        ignoreInitial: true,
        persistent: true,
      });

      watcher.on('all', (event, filePath) => {
        console.log(
          '\x1b[33m%s\x1b[0m',
          `File ${filePath} has been ${event}, restarting server...`
        );

        server.restart();
      });

      // Close the watcher when the server is closed
      server?.httpServer?.on('close', () => {
        watcher.close();
      });
    },
  };
};

const buildFlagQuery = (featureFlags?: Record<string, boolean>): string =>
  !featureFlags
    ? ''
    : Object.entries(featureFlags)
        .map(([key, value]) => `&ff_${value ? 'on' : 'off'}=${key}`)
        .join('');

export default defineConfig({
  server: {
    port: 1337,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    react(),
    wfDesignerExtensionPlugin(['../nextjs-app/app/api/**/*.ts']),
  ],
  root: './',
  base: './',
  build: {
    outDir: 'dist',
  },
});
