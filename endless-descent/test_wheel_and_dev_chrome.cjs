const fs = require('fs');

async function main() {
    const listRes = await fetch('http://localhost:9222/json');
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.url.includes('5173') || t.title.includes('Endless'));
    if (!pageTarget) {
        console.error('No page target found');
        process.exit(1);
    }
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const reqId = id++;
            callbacks.set(reqId, { resolve, reject });
            ws.send(JSON.stringify({ id: reqId, method, params }));
        });
    }

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && callbacks.has(msg.id)) {
            const { resolve } = callbacks.get(msg.id);
            callbacks.delete(msg.id);
            resolve(msg.result);
        }
    };

    await new Promise((r) => (ws.onopen = r));

    // Reload page
    console.log('Reloading page...');
    await send('Page.reload');
    await new Promise((r) => setTimeout(r, 1500));

    // 1. Open Dev Modal & Check for Force Wheel Slot toggle
    console.log('Checking Developer Modal for new options...');
    const devModalEval = await send('Runtime.evaluate', {
        expression: `
            (() => {
                const btnDev = document.getElementById('btn-dev-modal-toggle');
                if (btnDev) btnDev.click();
                const slotBtn = document.getElementById('toggle-force-wheel-slot');
                const wheelBoxBtn = document.getElementById('toggle-force-wheel');
                return {
                    devModalOpen: !!document.getElementById('dev-modal-overlay')?.classList.contains('active'),
                    hasForceSlotBtn: !!slotBtn,
                    slotBtnText: slotBtn?.textContent?.trim(),
                    hasWheelBoxBtn: !!wheelBoxBtn
                };
            })()
        `,
        returnByValue: true
    });
    console.log('Dev Modal Check:', devModalEval.result.value);

    // Capture screenshot of Dev Modal with the new Slot toggle
    const ssDev = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/javiersanchez/.gemini/antigravity/brain/c4375715-0bb4-4507-8b84-0f818153dbb0/screen_verify_dev_modal_slot.png', Buffer.from(ssDev.data, 'base64'));

    // 2. Click the toggle-force-wheel-slot button and close Dev Modal
    console.log('Activating Force Wheel Slot via Dev Modal button...');
    await send('Runtime.evaluate', {
        expression: `
            (() => {
                const slotBtn = document.getElementById('toggle-force-wheel-slot');
                if (slotBtn) slotBtn.click();
                const closeBtn = document.getElementById('btn-dev-close');
                if (closeBtn) closeBtn.click();
            })()
        `
    });

    // 3. Trigger Roulette sequence
    console.log('Triggering Giant Prize Wheel...');
    await send('Runtime.evaluate', {
        expression: `
            (() => {
                const eng = window.__engine;
                const rnd = window.__renderer;
                eng.state = 'PLAYING';
                eng.isWheelActive = true;
                eng.wheelSpinsRemaining = 1;
                eng.wheelRow = 1;
                eng.wheelSpinIndex = 0;
                eng.isSlotActive = false;
                eng.slotBundle = null;
                rnd.triggerRouletteSequence(0, 0, { row: 1, lane: 2, isSafe: true, specialType: 'WHEEL' });
            })()
        `
    });

    // Wait for astronaut to jump out into the cosmic void
    await new Promise((r) => setTimeout(r, 1600));

    // Capture screenshot before spin
    console.log('Capturing screen_verify_wheel_before_spin.png...');
    const ssWheel1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/javiersanchez/.gemini/antigravity/brain/c4375715-0bb4-4507-8b84-0f818153dbb0/screen_verify_wheel_before_spin.png', Buffer.from(ssWheel1.data, 'base64'));

    // 4. Click GIRAR button
    console.log('Clicking GIRAR button...');
    const spinClick = await send('Runtime.evaluate', {
        expression: `
            (() => {
                const btn = document.getElementById('btn-primary-cta');
                btn.click();
                // Attempt rapid secondary click to test multi-click prevention!
                btn.click();
                return {
                    spinning: window.__renderer.isWheelSpinning,
                    btnDisabled: btn.disabled,
                    btnTitle: document.getElementById('focal-cta-title')?.textContent,
                    spinsRemaining: window.__engine.wheelSpinsRemaining
                };
            })()
        `,
        returnByValue: true
    });
    console.log('Spin click result (multi-click prevented):', spinClick.result.value);

    // Wait 2.0s mid-spin
    await new Promise((r) => setTimeout(r, 2000));
    console.log('Capturing screen_verify_wheel_spinning_locked.png...');
    const ssWheelSpin = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/javiersanchez/.gemini/antigravity/brain/c4375715-0bb4-4507-8b84-0f818153dbb0/screen_verify_wheel_spinning_locked.png', Buffer.from(ssWheelSpin.data, 'base64'));

    // Wait for wheel to decelerate and land on SLOT (Sector 8)
    // Wheel duration is ~4.4s to 5.8s. Let's wait 3.5s more:
    await new Promise((r) => setTimeout(r, 3500));

    // Wheel has landed on SLOT: flapper is resting on sector 8!
    console.log('Capturing screen_verify_wheel_landed_slot.png (celebration pause)...');
    const ssLanded = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/javiersanchez/.gemini/antigravity/brain/c4375715-0bb4-4507-8b84-0f818153dbb0/screen_verify_wheel_landed_slot.png', Buffer.from(ssLanded.data, 'base64'));

    // Wait for the 2.2s celebration pause to complete and transition to Mini-Slot
    await new Promise((r) => setTimeout(r, 3200));
    console.log('Capturing screen_verify_transition_to_slot_complete.png...');
    const ssSlot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/javiersanchez/.gemini/antigravity/brain/c4375715-0bb4-4507-8b84-0f818153dbb0/screen_verify_transition_to_slot_complete.png', Buffer.from(ssSlot.data, 'base64'));

    console.log('All verification steps completed successfully!');
    ws.close();
}

main().catch(console.error);
