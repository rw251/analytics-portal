const localforage = require('localforage');
const $ = require('jquery');

const VERSION = '0.0.6';
const DEBUG = true;

const get = function get(key, ifExists, ifNotExists) {
  localforage.getItem(key, (err, value) => {
    if (err || !value) {
      return ifNotExists();
    }
    return ifExists(value);
  });
};

const data = {

  getLastUpdated(callback) {
    $.getJSON('/api/lastupdated', (lastUpdated) => {
      localforage.getItem('detail', (err, value) => {
        if (DEBUG || err || !value || !value.updated || !value.version ||
          value.updated !== lastUpdated || value.version !== VERSION) {
          localforage.clear(() => {
            localforage.setItem('detail', { updated: lastUpdated, version: VERSION });
            callback(lastUpdated);
          });
        } else {
          callback(lastUpdated);
        }
      });
    }).error(() => callback('2016-08-01T08:50:56.000Z'));
  },

  getSidebar(callback) {
    $.getJSON('/api/sidebar', sideBarData => callback(sideBarData)).error(() => callback(['top10', 'distributions', 'model']));
  },

  getSummary(callback) {
    get('summary', value => callback(value), () => {
      $.getJSON('/api/summaryparallel', (summaryData) => {
        localforage.setItem('summary', summaryData);
        return callback(summaryData);
      }).error(() => callback({ count: { allpatients: '120', activepatients: '65', dischargedpatients: { 'discharged with improvement': 27, 'discharged without improvement': 11, 'referred for surgery': 12, failure: 5 }, locations: '4', physios: '18', diagnoses: '6', prescriptions: '13' }, diagnostic: { age: '59.4595', occupation: '35.1351', diagnoses: '35.1351' }, updated: '2016-08-01T08:50:56.000Z' }));
    });
  },

  getAgeDistribution(callback) {
    get('distributionAge', value => callback(value), () => {
      $.getJSON('/api/distribution/age', (distData) => {
        localforage.setItem('distributionAge', distData);
        return callback(distData);
      }).error(() => callback({ title: 'Age distribution', data: [{ label: '0-9', lower: 0, value: 0 }, { label: '10-19', lower: 10, value: 5 }, { label: '20-29', lower: 20, value: 6 }, { label: '30-39', lower: 30, value: 5 }, { label: '40-49', lower: 40, value: 3 }, { label: '50-59', lower: 50, value: 4 }, { label: '60-69', lower: 60, value: 0 }, { label: '70-79', lower: 70, value: 1 }, { label: '80-89', lower: 80, value: 0 }, { label: '90-99', lower: 90, value: 0 }] }));
    });
  },

  getBMIDistribution(callback) {
    get('distributionBMI', value => callback(value), () => {
      $.getJSON('/api/distribution/bmi', (distData) => {
        localforage.setItem('distributionBMI', distData);
        return callback(distData);
      }).error(() => callback({ title: 'BMI distribution', data: [{ label: '0-4', lower: 0, value: 0 }, { label: '5-9', lower: 5, value: 0 }, { label: '10-14', lower: 10, value: 0 }, { label: '15-19', lower: 15, value: 0 }, { label: '20-24', lower: 20, value: 0 }, { label: '25-29', lower: 25, value: 0 }, { label: '30-34', lower: 30, value: 0 }, { label: '35-39', lower: 35, value: 0 }, { label: '40-44', lower: 40, value: 0 }] }));
    });
  },

  getUsageHoursDistribution(callback) {
    get('distributionHours', value => callback(value), () => {
      $.getJSON('/api/distribution/timeOfSession', (distData) => {
        localforage.setItem('distributionHours', distData);
        return callback(distData);
      }).error(() => callback({ title: 'Exercise session start time distribution', data: [{ label: '0', lower: 0, tot: 0 }, { label: '1', lower: 1, tot: 0 }, { label: '2', lower: 2, tot: 0 }, { label: '3', lower: 3, tot: 0 }, { label: '4', lower: 4, tot: 0 }, { label: '5', lower: 5, tot: 0 }, { label: '6', lower: 6, tot: 0 }, { label: '7', lower: 7, tot: 2 }, { label: '8', lower: 8, tot: 7 }, { label: '9', lower: 9, tot: 21 }, { label: '10', lower: 10, tot: 39 }, { label: '11', lower: 11, tot: 24 }, { label: '12', lower: 12, tot: 19 }, { label: '13', lower: 13, tot: 52 }, { label: '14', lower: 14, tot: 23 }, { label: '15', lower: 15, tot: 15 }, { label: '16', lower: 16, tot: 8 }, { label: '17', lower: 17, tot: 3 }, { label: '18', lower: 18, tot: 5 }, { label: '19', lower: 19, tot: 2 }, { label: '20', lower: 20, tot: 4 }, { label: '21', lower: 21, tot: 1 }, { label: '22', lower: 22, tot: 1 }, { label: '23', lower: 23, tot: 0 }] }));
    });
  },

  getSexDistribution(callback) {
    get('distributionSex', value => callback(value), () => {
      $.getJSON('/api/distribution/sex', (distData) => {
        localforage.setItem('distributionSex', distData);
        return callback(distData);
      }).error(() => callback({ title: 'Sex distribution', data: [{ label: 'Male', value: 12 }, { label: 'Female', value: 17 }] }));
    });
  },

  getExerciseFrequencyPerDayDistribution(callback) {
    get('exerciseFrequencyPerDay', value => callback(value), () => {
      $.getJSON('/api/distribution/exerciseFrequencyPerDay', (distData) => {
        localforage.setItem('exerciseFrequencyPerDay', distData);
        return callback(distData);
      }).error(() => callback({ title: 'Prescribed exercise frequency (# per day)', data: [{ label: '1', lower: 1, value: 6 }, { label: '2', lower: 2, value: 2 }, { label: '3', lower: 3, value: 7 }, { label: '4', lower: 4, value: 0 }, { label: '5', lower: 5, value: 0 }, { label: '6', lower: 6, value: 0 }, { label: '7', lower: 7, value: 39 }, { label: '8', lower: 8, value: 0 }, { label: '9', lower: 9, value: 0 }, { label: '10', lower: 10, value: 0 }, { label: '11', lower: 11, value: 0 }, { label: '12', lower: 12, value: 0 }, { label: '13', lower: 13, value: 0 }, { label: '14', lower: 14, value: 21 }, { label: '15', lower: 15, value: 0 }, { label: '16', lower: 16, value: 0 }, { label: '17', lower: 17, value: 0 }, { label: '18', lower: 18, value: 0 }, { label: '19', lower: 19, value: 0 }, { label: '20', lower: 20, value: 0 }, { label: '21', lower: 21, value: 3 }, { label: '22', lower: 22, value: 0 }, { label: '23', lower: 23, value: 0 }, { label: '24', lower: 24, value: 0 }, { label: '25', lower: 25, value: 0 }, { label: '26', lower: 26, value: 0 }, { label: '27', lower: 27, value: 0 }, { label: '28', lower: 28, value: 0 }] }));
    });
  },

  getExerciseFrequencyPerWeekDistribution(callback) {
    get('exerciseFrequencyPerWeek', value => callback(value), () => {
      $.getJSON('/api/distribution/exerciseFrequencyPerWeek', (distData) => {
        localforage.setItem('exerciseFrequencyPerWeek', distData);
        return callback(distData);
      }).error(() => callback({ title: 'Prescribed exercise frequency (# per week)', data: [{ label: '1', lower: 1, value: 6 }, { label: '2', lower: 2, value: 2 }, { label: '3', lower: 3, value: 7 }, { label: '4', lower: 4, value: 0 }, { label: '5', lower: 5, value: 0 }, { label: '6', lower: 6, value: 0 }, { label: '7', lower: 7, value: 39 }, { label: '8', lower: 8, value: 0 }, { label: '9', lower: 9, value: 0 }, { label: '10', lower: 10, value: 0 }, { label: '11', lower: 11, value: 0 }, { label: '12', lower: 12, value: 0 }, { label: '13', lower: 13, value: 0 }, { label: '14', lower: 14, value: 21 }, { label: '15', lower: 15, value: 0 }, { label: '16', lower: 16, value: 0 }, { label: '17', lower: 17, value: 0 }, { label: '18', lower: 18, value: 0 }, { label: '19', lower: 19, value: 0 }, { label: '20', lower: 20, value: 0 }, { label: '21', lower: 21, value: 3 }, { label: '22', lower: 22, value: 0 }, { label: '23', lower: 23, value: 0 }, { label: '24', lower: 24, value: 0 }, { label: '25', lower: 25, value: 0 }, { label: '26', lower: 26, value: 0 }, { label: '27', lower: 27, value: 0 }, { label: '28', lower: 28, value: 0 }] }));
    });
  },

  getLocations(callback) {
    get('locations', value => callback(value), () => {
      $.getJSON('/api/locations', (locData) => {
        localforage.setItem('locations', locData);
        return callback(locData);
      }).error(() => callback({ title: 'Sex distribution', data: [{ label: 'Male', value: 12 }, { label: 'Female', value: 17 }] }));
    });
  },

  getTop10Categories(callback) {
    $.getJSON('/api/top10', top10Data => callback(top10Data)).error(() => callback(['physios', 'prescriptions', 'diagnoses', 'locations']));
  },

  getTop10(category, callback) {
    get(`top10.${category}`, value => callback(value), () => {
      $.getJSON(`/api/top10/${category}`, (top10Data) => {
        localforage.setItem(`top10.${category}`, top10Data);
        return callback(top10Data);
      }).error(() => {
        data.getTop10FAKE(callback);
      });
    });
  },

  getTop10FAKE(callback) {
    const min = Math.random() * 20;
    const range = Math.random() * 50;
    const dt = [];
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let n = 10;
    while (n > 0) {
      dt.push({ value: min + (Math.random() * range), name: labels[10 - n] });
      n -= 1;
    }
    dt.sort((a, b) => b.value - a.value);
    return callback({
      title: 'Top 10...',
      data: dt,
    });
  },

  getModelDefaults(callback) {
    // get('modelDefaults', function(value) {
    //  return callback(value);
    // }, function() {
    $.getJSON('/api/model', (model) => {
      const modelData = model;
        // min max age
      if (modelData.age) {
        modelData.ageFrom = 120;
        modelData.ageTo = 0;
        modelData.age.forEach((v) => {
          if (v.age && v.age < modelData.ageFrom) {
            modelData.ageFrom = v.age;
          }
          if (v.age && v.age > modelData.ageTo) {
            modelData.ageTo = v.age;
          }
          if (!v.age) {
            modelData.ageUnknown = v.num;
          }
        });
      } else {
        modelData.ageFrom = 0;
        modelData.ageTo = 120;
        modelData.ageUnknown = 0;
      }
      if (modelData.sexes) {
        modelData.sexes.forEach((v) => {
          modelData[v.sex] = v.num;
        });
      }
      localforage.setItem('modelDefaults', modelData);
      return callback(modelData);
    }).error(() => callback({}));
    // });
  },

};

module.exports = data;
