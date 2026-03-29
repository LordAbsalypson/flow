import { test, expect } from '@playwright/test';

test('run app tutorial and capture screenshots', async ({ page }) => {
  // Go to Home
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'public/tutorial/1_home.png' });

  // Click Start
  const startBtn = page.getByRole('button', { name: /start/i });
  if (await startBtn.isVisible()) {
    await startBtn.click();
  } else {
    // If it's a link or just a card
    await page.click('text=Start');
  }
  
  await page.waitForURL('**/selection');
  await page.screenshot({ path: 'public/tutorial/2_selection.png' });

  // Select a mood (e.g. Happy)
  await page.click('text=Happy');
  await page.waitForURL('**/play/happy');
  
  // Wait for song to load (Gemini takes a bit)
  await page.waitForSelector('iframe', { timeout: 30000 });
  await page.screenshot({ path: 'public/tutorial/3_player.png' });

  // Simulate scanning QR code (go to vote page)
  const currentUrl = page.url();
  // Extract sessionId from localStorage if needed, or just follow the flow
  const sessionId = await page.evaluate(() => localStorage.getItem('flow_session_id'));
  
  if (sessionId) {
    await page.goto(`http://localhost:3000/vote/${sessionId}`);
    await page.waitForSelector('h2'); // Song title should appear
    await page.screenshot({ path: 'public/tutorial/4_rating.png' });

    // Click a rating
    await page.click('button[aria-label="Rate 5 out of 5"]');
    await page.screenshot({ path: 'public/tutorial/5_rated.png' });

    // Click an emoji
    await page.click('button[aria-label="Select emoji happy"]');
    await page.screenshot({ path: 'public/tutorial/6_emoji.png' });
  }
});
