# Storyline Visualization for the Sims 4 Story

## Introduction

To be updated.

As for now, this web app supports visualizing the following information:

- Basic story character information (Sims created and Sim's important Contacts)
- Players' positions over time
- Players' events over time

(more details to be updated)

## Installation

Use the package manager [npm](https://docs.npmjs.com/cli/install) or [yarn](https://yarnpkg.com/lang/en/docs/cli/add/) to install iStoryline.

```Shell
npm install i-storyline-js
```

or

```Shell
yarn add i-storyline-js
```

## Basic Usage of iStoryline framework

```JavaScript
import iStoryline from "i-storyline-js"
let iStoryliner = new iStoryline();

// generate storyline visualizations from the story script
let storyScriptUrl = './data/xml/Redcap.xml';

// graph can be drawed using any canvas or svg libraries
let graph = iStoryliner.load(storyScriptUrl);

// obtain the characters names
console.log(graph.characters);  // ['Red cap', 'Mother', 'Wolf', 'GrandMa']

// obtain the paths of the characters
console.log(graph.storylines);  // [[[x1, y1], [x2, y2], ...], ...]
```

-------- Below also need to be updated --------

## Basic Usage of iStoryline framework for the Sims 4

First using our python project to fetch the match data and convert it into a storyline json file. This will ultimately gives you match spatio-temporal data, general match information file, a killing info file and a DBSCAN result.
For this, check our [Lol_Storyline Data](https://github.com/tiange997/LoL-Storyline-Data) project and follow the instructions there.

You should put your visualization instance javascript file under the `/app/js` folder. You should also check the `/data/json/Match`
folder to see the data files that are used in the storyline visualisation.

To create a new match visualization instance, you can start copying one file from the `/app/js` folder, rename it and make changes as following:

```JavaScript

// adding match info to the storyline (fetched from Riot API)
const jsonRead = d3Fetch.json('../../data/json/xxx.json')

// adding killing info file generated by python
const jsonReadTwo = d3Fetch.json('../../data/json/xxx.json')

// adding DBSCAN result file generated by python
const jsonDBSCAN = d3Fetch.json('../../data/json/xxx.json')

// adding the match data generated by python for parsing
main('xxx.json');


```

Please then check and modify the webpack config file for new entry.

### Notes

- Drawing APIs are based on [canvas](https://www.w3schools.com/html/html5_canvas.asp) or [svg](https://www.w3schools.com/html/html5_svg.asp).

## Storyline Board

iStoryline.js provides a build-in editor for producing storyline visualizations.

1. Install Node.js (>= 10.0)

2. Install dependencies `npm i` or `yarn`

3. Start the editor `npm run start`

4. Please visit [localhost:8080](http://localhost:8080)

## Framework Documentation

- [Story Script](https://github.com/tangtan/iStoryline.js/wiki/Story-Script)

- [Data Workflow](https://github.com/tangtan/iStoryline.js/wiki/Data-Workflow)

- [API Reference](https://github.com/tangtan/iStoryline.js/wiki/API-Reference)

- [Graph Drawing](https://github.com/tangtan/iStoryline.js/wiki/Graph-Drawing)

## References

1. G. Wallner, **L. Wang**, and C. Dormann. "Visualizing the Spatio-Temporal Evolution of Gameplay using Storyline Visualization: A Study with League of Legends. Proc. ACM Hum.-Comput. Interact.", 7(CHI PLAY):412, 2023.
2. T. Tang, S. Rubab, J. Lai, W. Cui, L. Yu, and Y. Wu. "iStoryline: Effective Convergence to Hand-drawn Storylines. IEEE Transactions on Visualization and Computer Graphics", 25(1):769-778, 2019.
3. S. Liu, Y. Wu, E. Wei, M. Liu, and Y. Liu. "StoryFlow: Tracking the Evolution of Stories. IEEE Transactions on Visualization and Computer Graphics", 19(12):2436–2445, 2013.

## Citation

We appreciate your citation if this GitHub repo contributes to your work.

```bib

```

## License

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
