import { test, expect } from '@playwright/test';

const drawHighlight = async (page: any, selector: string, label: string) => {
  await page.evaluate(({ selector, label }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    
    // Circle
    const circle = document.createElement('div');
    circle.style.cssText = `
      position: fixed;
      top: ${rect.top - 10}px;
      left: ${rect.left - 10}px;
      width: ${rect.width + 20}px;
      height: ${rect.height + 20}px;
      border: 6px solid red;
      border-radius: 50%;
      z-index: 10000;
      pointer-events: none;
    `;
    
    // Arrow (simple CSS)
    const arrow = document.createElement('div');
    arrow.innerHTML = 'â';
    arrow.style.cssText = `
      position: fixed;
      top: ${rect.top + rect.height/2 - 20}px;
      left: ${rect.left - 80}px;
      font-size: 60px;
      color: red;
      z-index: 10001;
      pointer-events: none;
    `;

    // Label
    const text = document.createElement('div');
    text.innerText = label;
    text.style.cssText = `
      position: fixed;
      top: ${rect.top - 60}px;
      left: ${rect.left}px;
      background: red;
      color: white;
      padding: 8px 16px;
      font-weight: bold;
      font-size: 24px;
      border-radius: 8px;
      z-index: 10002;
    `;

    document.body.appendChild(circle);
    document.body.appendChild(arrow);
    document.body.appendChild(text);
    
    setTimeout(() => {
      circle.remove();
      arrow.remove();
      text.remove();
    }, 3000);
  }, { selector, label });
};

test.describe('Refined Video Tutorials', () => {
  test('1_localhost: Installation & Start', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'public/tutorial/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000');
    
    // Step 1: Console Simulation
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div style="background:#1e1e1e; color:#d4d4d4; font-family:monospace; padding:40px; height:100vh; font-size:24px;">
          <p style="color:#569cd6;">> flow@0.0.0 local</p>
          <p style="color:#569cd6;">> npm run build && tsx server/index.ts</p>
          <br>
          <p style="color:#ce9178;">vite v6.4.1 building for production...</p>
          <p style="color:#ce9178;">â built in 1.8s</p>
          <br>
          <p style="color:#b5cea8;">Server running locally: http://localhost:3001</p>
          <p style="color:#4ec9b0; font-weight:bold; font-size:32px; border:4px solid #4ec9b0; padding:20px; display:inline-block; margin:20px 0;">
            Server running on network: http://192.168.1.50:3001
          </p>
          <p style="color:#dcdcaa;">â¹ï¸ IMPORTANT: Use this address if connecting from other devices!</p>
          
          <div id="step-overlay" style="position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:white; color:black; padding:30px; border-radius:20px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="font-size:40px; margin:0;">Step 1: Start the server</h2>
            <p style="font-size:24px;">Run <code>npm run local</code> in your terminal.</p>
          </div>
        </div>
      `;
    });
    await page.waitForTimeout(4000);

    // Step 2: Entering IP in browser
    await page.evaluate(() => {
      const overlay = document.getElementById('step-overlay')!;
      overlay.innerHTML = `
        <h2 style="font-size:40px; margin:0;">Step 2: Enter IP in Browser</h2>
        <p style="font-size:24px;">Type the address (e.g., 192.168.1.50:3001) into your browser.</p>
      `;
      // Simulate browser address bar
      const bar = document.createElement('div');
      bar.style.cssText = "position:fixed; top:50px; left:10%; width:80%; height:60px; background:#f1f3f4; border-radius:30px; border:2px solid #ccc; display:flex; align-items:center; padding:0 30px; font-size:28px; color:black;";
      bar.innerHTML = 'â http://192.168.1.50:3001';
      document.body.appendChild(bar);
    });
    await page.waitForTimeout(4000);

    // Step 3: Show Application Home
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      const banner = document.createElement('div');
      banner.innerHTML = "STEP 3: Welcome to Flow!";
      banner.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:purple; color:white; padding:20px 40px; font-size:40px; font-weight:bold; border-radius:50px; z-index:9999; box-shadow:0 10px 20px rgba(0,0,0,0.3);";
      document.body.appendChild(banner);
    });
    await page.waitForTimeout(4000);

    await context.close();
  });

  test('2_usage: Mainframe & Selection', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'public/tutorial/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000');
    
    // Highlight Play Button
    await drawHighlight(page, 'button[aria-label="Play Music"]', 'Click Play to start music selection');
    await page.waitForTimeout(3500);
    await page.click('button[aria-label="Play Music"]');

    // Selection Page
    await page.waitForURL('**/selection');
    await page.waitForTimeout(1000);
    
    // Search highlight
    await drawHighlight(page, 'input[placeholder="Search for a song..."]', 'Search for any song here');
    await page.fill('input[placeholder="Search for a song..."]', 'Hello Adele');
    await page.waitForTimeout(3000); // Wait for results
    
    // Select the song
    await page.click('text=Hello - Adele');
    
    // Player screen
    await page.waitForURL('**/play/**');
    await page.waitForSelector('iframe', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Highlight QR Code
    await drawHighlight(page, 'canvas, svg', 'QR CODE: Clients scan this to rate!');
    await page.waitForTimeout(3500);

    // Highlight Info
    await drawHighlight(page, 'h4:has-text("Info")', 'Song facts for the clients');
    await page.waitForTimeout(3500);

    // Highlight Toggle
    await drawHighlight(page, 'button:has-text("Original")', 'Switch between Summary and Lyrics');
    await page.click('button:has-text("Original")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Summary")');
    await page.waitForTimeout(2000);

    // Next Song
    await drawHighlight(page, 'button:has-text("Next Song")', 'Go back to selection');
    await page.click('button:has-text("Next Song")');
    await page.waitForTimeout(2000);

    await context.close();
  });

  test('3_gdpr: Security Compliance', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'public/tutorial/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    
    // Slide 1: Localhost GDPR
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div style="background:#e8f5e9; height:100vh; padding:60px; font-family:sans-serif;">
          <h1 style="font-size:60px; color:#2e7d32;">GDPR: Local Hosting</h1>
          <div style="font-size:32px; line-height:1.5;">
            <p>â <b>Full Data Sovereignty:</b> Your data never leaves this building.</p>
            <p>â <b>Anonymous:</b> No names, only random IDs (UUIDs) are stored.</p>
            <p>â <b>Secure:</b> Local database (db.json) is accessible only via your network.</p>
            <p>â¹ï¸ <b>Daycare Benefit:</b> Meets highest EU privacy standards for sensitive client data.</p>
          </div>
        </div>
      `;
    });
    await page.waitForTimeout(6000);

    // Slide 2: Server-Hosted GDPR
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div style="background:#fff3e0; height:100vh; padding:60px; font-family:sans-serif;">
          <h1 style="font-size:60px; color:#ef6c00;">GDPR: Server Hosting (Cloud)</h1>
          <div style="font-size:32px; line-height:1.5;">
            <p>â ï¸ <b>Shared Responsibility:</b> Data is stored in secure EU data centers.</p>
            <p>â <b>DPA Required:</b> Contract with provider ensures legal safety.</p>
            <p>â <b>Encryption:</b> Data is encrypted in transit and at rest.</p>
            <p>â <b>Professional Security:</b> Protected by enterprise firewalls and backups.</p>
          </div>
        </div>
      `;
    });
    await page.waitForTimeout(6000);

    // Slide 3: Client Data Collection
    await page.evaluate(() => {
      document.body.innerHTML = `
        <div style="background:#f3e5f5; height:100vh; padding:60px; font-family:sans-serif;">
          <h1 style="font-size:60px; color:#7b1fa2;">What data is collected?</h1>
          <table style="width:100%; border-collapse:collapse; font-size:28px;">
            <tr style="background:#ce93d8;">
              <th style="padding:20px; text-align:left;">Device</th>
              <th style="padding:20px; text-align:left;">Data Type</th>
              <th style="padding:20px; text-align:left;">Purpose</th>
            </tr>
            <tr>
              <td style="padding:20px;">Staff (Player)</td>
              <td>Session ID</td>
              <td>Groups ratings together</td>
            </tr>
            <tr>
              <td style="padding:20px;">Client (Voter)</td>
              <td>Anonymous ID, Vote</td>
              <td>Saves ranking results</td>
            </tr>
          </table>
          <p style="font-size:24px; margin-top:40px;">* No names, images, or birthdays are ever recorded.</p>
        </div>
      `;
    });
    await page.waitForTimeout(8000);

    await context.close();
  });
});
