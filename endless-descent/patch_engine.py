import re

with open('src/game/engine.ts', 'r') as f:
    content = f.read()

# Add rotation logic
content = content.replace('this.changeState(GameState.CRASHED);',
'''this.previousServerSeed = this.serverSeed;
            this.serverSeed = generateServerSeed();
            this.changeState(GameState.CRASHED);''')

content = content.replace('this.changeState(GameState.WON);',
'''this.previousServerSeed = this.serverSeed;
        this.serverSeed = generateServerSeed();
        this.changeState(GameState.WON);''')

with open('src/game/engine.ts', 'w') as f:
    f.write(content)
