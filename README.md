# Birdseye

Quick, convenient, expression-centric, graphical Python debugger using the AST

![Stepping through loop iterations](https://i.imgur.com/236Gj2E.gif)

Thanks to Alex Mojaki's wonderful [birdseye](https://github.com/alexmojaki/birdseye)

## Usage and features

For a quick demonstration, copy [this example](https://github.com/alexmojaki/birdseye/blob/master/example_usage.py) and run it. Then continue from step 2 below.

To debug your own function, decorate it with `birdseye.eye`, e.g.

```
from birdseye import eye

@eye
def foo():
```

**The `eye` decorator *must* be applied before any other decorators, i.e. at the bottom of the list.**

1. Run your python file.
    * You can use any extension to do so.  Examples:
    * [Official Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) | [Code Runner](https://marketplace.visualstudio.com/items?itemName=formulahendry.code-runner) | [AREPL](https://github.com/Almenon/AREPL-vscode) | [wolf](https://marketplace.visualstudio.com/items?itemName=traBpUkciP.wolf)
    * Or you can just use the command line... really anything works
2. Launch birdseye
    * (F1 -> Birdseye)
3. Click on:
    1. The name of the file containing your function
    2. The name of the function
    3. The most recent call to the function

When viewing a function call, you can:

- Hover over an expression to view its value at the bottom of the screen.
- Click on an expression to select it so that it stays in the inspection panel, allowing you to view several values simultaneously and expand objects and data structures. Click again to deselect.
- Hover over an item in the inspection panel and it will be highlighted in the code.
- Drag the bar at the top of the inspection panel to resize it vertically.
- Click on the arrows next to loops to step back and forth through iterations. Click on the number in the middle for a dropdown to jump straight to a particular iteration.
- If the function call you're viewing includes a function call that was also traced, the expression where the call happens will have an arrow (![blue curved arrow](https://i.imgur.com/W7DfVeg.png)) in the corner which you can click on to go to that function call. This doesn't work when calling generator functions.

## Performance, volume of data, and limitations

Every function call is recorded, and every nontrivial expression is traced. This means that:

- Programs are greatly slowed down, and you should be wary of tracing code that has many function calls or iterations. Function calls are not visible in the interface until they have been completed.
- A large amount of data may be collected for every function call, especially for functions with many loop iterations and large nested objects and data structures. This may be a problem for memory both when running the program and viewing results in your browser.
- To limit the amount of data saved, only a sample is stored. Specifically:
  - The first and last 3 iterations of loops.
  - The first and last 3 values of sequences such as lists.
  - 10 items of mappings such as dictionaries.
  - 6 values of sets.
  - A limited version of the `repr()` of values is used, provided by the [cheap_repr](https://github.com/alexmojaki/cheap_repr) package.
  - Nested data structures and objects can only be expanded by up to 3 levels. Inside loops, this is decreased.

There is no API at the moment to collect more or less data. Suggestions are welcome as it's not obvious how to deal with the problem. But the idea of this tool is to be as quick and convenient as possible and to work for most cases. If in a particular situation you have to think carefully about how to use it, it may be better to use more conventional debugging methods.

Asynchronous code is not supported.

In IPython shells and notebooks, `shell.ast_transformers` is ignored in decorated functions.

This readme *may not be up to date!* - see https://github.com/alexmojaki/birdseye for the latest and greatest

## Other stuff

Thanks to Sergi Delgado for the cool-looking eye icon