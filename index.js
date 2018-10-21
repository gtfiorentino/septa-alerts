const fetch = require('node-fetch');

const TRAIN_VIEW_URL = 'http://www3.septa.org/hackathon/TrainView/';
const SCHEDULE_URL = 'http://www3.septa.org/hackathon/RRSchedules/';

async function main() {
  try {
    // "Train View" returns top-level data about each train
    const trainView = await fetchJson(TRAIN_VIEW_URL);

    // Append schedule to train view for full train data
    const trainData = await getScheduleData(trainView);

    console.log(JSON.stringify(trainData));
  } catch (error) {
    console.error(error);
  }
}

// Append schedule data (including stops and times) 
// for each train in Train View
async function getScheduleData(trainView) {
  const trainDataRequests = trainView
      .map(async t => {
        const trainStops = await fetchJson(`${SCHEDULE_URL}/${t.trainno}`);

        return {
          ...t,
          trainStops,
        };
      });

    trainData = await Promise.all(trainDataRequests);

    return trainData;
}

// fetchJson simplifies the pattern of fetching and parsing json response
async function fetchJson(url) {
  const response = await fetch(url);
  const responseJson = await response.json();

  return responseJson;
}

main();
