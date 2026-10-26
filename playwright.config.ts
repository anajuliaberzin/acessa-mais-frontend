import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./e2e/accessibility', fullyParallel:false, workers:1, retries:0,
  use:{baseURL:'http://127.0.0.1:4300',trace:'retain-on-failure'},
  webServer:{command:'npm.cmd start -- --host 127.0.0.1 --port 4300',url:'http://127.0.0.1:4300',reuseExistingServer:false,timeout:120000},
  projects:[{name:'edge',use:{browserName:'chromium',channel:'msedge'}}],
});
