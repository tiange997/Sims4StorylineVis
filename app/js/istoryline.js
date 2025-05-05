import { drawSimsStoryline } from '../../src/js/utils/simsDrawer.js';

// Mock data for two generations of Sims
const simsData = {
  generation1: [
    {
      name: 'Sim1',
      color: '#FF5733',
      path: [
        [[100, 100], [200, 200], [300, 300]],
        [[300, 300], [400, 400], [500, 500]],
      ],
    },
    {
      name: 'Sim2',
      color: '#33FF57',
      path: [
        [[150, 150], [250, 250], [350, 350]],
        [[350, 350], [450, 450], [550, 550]],
      ],
    },
  ],
  generation2: [
    {
      name: 'Sim3',
      color: '#3357FF',
      path: [
        [[200, 200], [300, 300], [400, 400]],
        [[400, 400], [500, 500], [600, 600]],
      ],
    },
    {
      name: 'Sim4',
      color: '#FF33A1',
      path: [
        [[250, 250], [350, 350], [450, 450]],
        [[450, 450], [550, 550], [650, 650]],
      ],
    },
  ],
};

// Function to initialize and draw the Sims story
function initSimsStory() {
  Object.values(simsData).forEach(generation => {
    generation.forEach(sim => {
      drawSimsStoryline(sim.name, sim.path);
    });
  });
}

// Initialize the Sims story visualization
initSimsStory();
