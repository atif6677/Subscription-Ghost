const { startCronJob } = require('./cronJob');
const { startNewsCron } = require('./newsCron');


const initJobs = () => {
    startCronJob();
    startNewsCron();
    // startWeeklyReport();
};

module.exports = { initJobs };