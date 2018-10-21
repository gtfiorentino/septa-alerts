const fetch = require('node-fetch');

const TRAIN_VIEW_URL = 'http://www3.septa.org/hackathon/TrainView/';
const SCHEDULE_URL = 'http://www3.septa.org/hackathon/RRSchedules/';

const MY_TRAIN = '9467';
const MY_STATION = 'Suburban Station';

async function main() {
  try {
    // "Train View" returns top-level data about each train
    const trainView = await fetchJson(TRAIN_VIEW_URL);

    // Append schedule to train view for full train data
    const trainData = await getScheduleData(trainView);

    if (isTrainLate(MY_TRAIN, trainData)) {
      console.log(getTrainStop(MY_TRAIN, trainData, MY_STATION));
    } else {
      console.log(`Train ${MY_TRAIN} is on time`);
    }
  } catch (error) {
    console.log({ error });
  }
}

// getTrain finds train data by train number (trainno)
function getTrain(trainno, trainData) {
  const train = trainData.find(t => t.trainno === trainno);

  if (!train) throw new Error(`Train ${trainno} not found`);

  return train;
}

// isTrainLate returns true when train's late property is greater than zero
function isTrainLate(trainno, trainData) {
  const train = getTrain(trainno, trainData);

  return train.late > 0;
}

// getTrainStop returns data for a specific station stop associated with
// a train number (trainno)
function getTrainStop(trainno, trainData, station) {
  const train = getTrain(trainno, trainData);

  const trainStop = train.trainStops.find(tS => tS.station === station)

  return {
    ...trainStop,
    trainno,
  };
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
