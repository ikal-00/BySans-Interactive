import re

with open('src/ui/seedModal.ts', 'r') as f:
    content = f.read()

content = content.replace('container.appendChild(trigger);',
'''
    engine.setCallbacks((state) => {
        if (state === "WON" || state === "CRASHED") {
            const prevInput = document.getElementById("prev-server-seed") as HTMLInputElement;
            if (prevInput) {
                prevInput.value = engine.previousServerSeed;
            }
        }
    }, () => {});
    container.appendChild(trigger);
''')

with open('src/ui/seedModal.ts', 'w') as f:
    f.write(content)
