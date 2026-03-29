import { test, expect } from '@playwright/test';

test.describe('Video Tutorials', () => {
  test('1_localhost: How to start the app', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'public/tutorial/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    
    // Show the GUIDE
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;padding:40px;text-align:center;">
          <h1 style="font-size:48px;">Step 1: Installation & Start</h1>
          <p style="font-size:24px;">1. Open your terminal.</p>
          <p style="font-size:24px;">2. Type: <code>npm run local</code></p>
          <p style="font-size:24px;">3. Open your browser at the address shown in the terminal.</p>
          <div style="background:#f0f0f0;padding:20px;border-radius:10px;margin-top:20px;font-family:monospace;font-size:20px;">
            Server running on: http://192.168.1.50:3001
          </div>
          <p style="font-size:20px;margin-top:40px;color:green;">â The app is now running locally on your machine!</p>
        </div>
      `;
      document.body.appendChild(el);
    });
    await page.waitForTimeout(5000);
    await context.close();
  });

  test('2_usage: How to use (Social Worker & Client)', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'public/tutorial/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    
    // Social Worker Side
    await page.goto('http://localhost:3000');
    await page.click('text=Play');
    await page.waitForTimeout(1000);
    await page.click('text=Happy');
    await page.waitForTimeout(3000); // Wait for song load
    
    // Show the Player
    await page.evaluate(() => {
        const toast = document.createElement('div');
        toast.innerHTML = "SOCIAL WORKER: You pick a mood and music starts playing.";
        toast.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:blue;color:white;padding:20px;font-size:24px;border-radius:10px;z-index:9999;";
        document.body.appendChild(toast);
    });
    await page.waitForTimeout(4000);

    // Client Side Simulation
    const sessionId = await page.evaluate(() => localStorage.getItem('flow_session_id'));
    await page.goto(`http://localhost:3000/vote/${sessionId}`);
    await page.evaluate(() => {
        const toast = document.createElement('div');
        toast.innerHTML = "CLIENT: Scan the QR code to reach this page and vote!";
        toast.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:green;color:white;padding:20px;font-size:24px;border-radius:10px;z-index:9999;";
        document.body.appendChild(toast);
    });
    await page.click('button[aria-label="Rate 5 out of 5"]');
    await page.waitForTimeout(2000);
    await page.click('button[aria-label="Select emoji happy"]');
    await page.waitForTimeout(4000);

    await context.close();
  });

  test('3_gdpr: Security & Privacy', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'public/tutorial/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    
    const sessionId = 'tutorial-session';
    await page.goto(`http://localhost:3000/vote/${sessionId}`);
    
    await page.evaluate(() => {
        const overlay = document.createElement('div');
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,0,0.2);pointer-events:none;z-index:9998;border: 10px solid yellow;";
        document.body.appendChild(overlay);
        
        const toast = document.createElement('div');
        toast.innerHTML = "DATA SECURITY: Every vote is anonymous. Data stays on your local server.";
        toast.style.cssText = "position:fixed;bottom:150px;left:50%;transform:translateX(-50%);background:black;color:white;padding:20px;font-size:24px;border-radius:10px;z-index:9999;";
        document.body.appendChild(toast);
    });
    
    // Scroll to privacy notice
    await page.locator('text=Privacy Notice').scrollIntoViewIfNeeded();
    await page.waitForTimeout(6000);

    await context.close();
  });
});
