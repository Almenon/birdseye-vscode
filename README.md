# Birdseye  [![Downloads](https://vsmarketplacebadge.apphb.com/installs/almenon.birdseye-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=almenon.birdseye-vscode)

Quick, convenient, expression-centric, graphical Python debugger using the AST

![Stepping through loop iterations](https://i.imgur.com/236Gj2E.gif)

## Usage and features

To debug your own function, decorate it with `birdseye.eye`, e.g.

```
from birdseye import eye

@eye
def foo():
```

This extension is just a wrapper around Alex Mojaki's birdseye library - look [here](https://birdseye.readthedocs.io) for the full documentation
