var auth = require('./auth.js'),
  db = require('./db.js');

var q = function(roles, role, yesUserSiteNone) {
  if (roles[role] === auth.yes) {
    return yesUserSiteNone[0];
  } else if (roles[role] === auth.byUser) {
    return yesUserSiteNone[1];
  } else if (roles[role] === auth.bySite) {
    return yesUserSiteNone[2];
  } else {
    return yesUserSiteNone[3];
  }
};

var histogram = function(data, cats) {
  cats = cats.map(function(v) {
    return { label: v, lower: +(v.split("-")[0]), value: 0 };
  });
  data.forEach(function(v) {
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].lower > v.val) {
        cats[i - 1].value++;
        break;
      }
    }
  });
  return cats;
};

module.exports = {
  last_updated: {
    query: function(dataObj) {
      return 'SELECT MAX(startDate) as last_updated FROM exercise_session';
    },
    result: function(rows) {
      return rows[0].last_updated;
    }
  },
  sidebar: {
    text: "The sidebar",
    roles: {
      mujo: ["top10", "locations", "distributions", "model"],
      operator: ["top10", "distributions", "model"],
      provider: ["top10", "locations", "distributions", "model"],
      payor: ["top10", "locations", "distributions", "model"]
    }
  },
  numberPatients: {
    text: "Total number of patients",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT COUNT(*) cnt FROM patient_info_copy',
        'SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE u.email = ' + db.get().escape(dataObj.user.email) + ') as sub',
        'SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId WHERE s.id in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')) as sub'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  numberActivePatients: {
    text: "Total number of active patients",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT COUNT(*) cnt FROM patient_info_copy WHERE outcome IS NULL OR outcome=""',
        'SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId  WHERE (p.outcome IS NULL OR p.outcome="") AND u.email = ' + db.get().escape(dataObj.user.email) + ') as sub',
        'SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId  WHERE (p.outcome IS NULL OR p.outcome="") AND s.id in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')) as sub'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  numberDischarged: {
    text: "Total number of discharged patients",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT COUNT(*) cnt FROM patient_info_copy WHERE outcome IS NOT NULL AND outcome!=""',
        'SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId  WHERE (p.outcome IS NOT NULL AND p.outcome!="") AND u.email = ' + db.get().escape(dataObj.user.email) + ') as sub',
        'SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId  WHERE (p.outcome IS NOT NULL AND p.outcome!="") AND s.id in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')) as sub'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  numberDischargedWithOutcome: {
    text: "Total number of discharged patients given a certain outcome",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(outcome,'[/OUTCOME]',1),'|',-1) as outcum, count(*) as cnt FROM patient_info_copy WHERE outcome REGEXP '\\[OUTCOME\\][^\\[]+\\[/OUTCOME\\]' GROUP BY outcum",
        '',
        "SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(outcome,'[/OUTCOME]',1),'|',-1) as outcum, count(*) as cnt FROM patient_info_copy WHERE outcome REGEXP '\\[OUTCOME\\][^\\[]+\\[/OUTCOME\\]' AND userId IN (SELECT userId FROM prescription WHERE siteId in (" + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ") GROUP BY userId) GROUP BY outcum"
      ]);
    },
    result: function(rows) {
      var outcomes = ["", "discharged with improvement", "discharged without improvement", "referred to surgery", "failure"];
      var rtn = {};
      rows.forEach(function(v) {
        rtn[outcomes[v.outcum]] = v.cnt;
      });
      return rtn;
    }
  },
  numberPhysios: {
    text: "Total number of physios",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) as cnt FROM (SELECT c.id FROM user_copy c INNER JOIN user_role r on c.userRoleId=r.id WHERE LOWER(r.name)="physio" GROUP BY c.id) as sub',
        'SELECT count(*) as cnt FROM (SELECT c.id FROM user_copy c INNER JOIN user_role r on c.userRoleId=r.id WHERE LOWER(r.name)="physio" GROUP BY c.id) as sub',
        'SELECT count(*) as cnt FROM (SELECT c.id FROM user_copy c INNER JOIN user_role r on c.userRoleId=r.id WHERE LOWER(r.name)="physio" AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY c.id) as sub'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  numberDiagnoses: {
    text: "Total number of diagnoses",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) as cnt FROM (SELECT diagnosis FROM patient_info_copy WHERE diagnosis is not null AND diagnosis != "" GROUP BY diagnosis) as sub',
        'SELECT count(*) as cnt FROM (SELECT diagnosis FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE diagnosis is not null AND diagnosis != "" AND email = ' + db.get().escape(dataObj.user.email) + ') GROUP BY diagnosis) as sub',
        'SELECT count(*) as cnt FROM (SELECT diagnosis FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE diagnosis is not null AND diagnosis != ""  AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY diagnosis) as sub'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  numberTotalPrescriptions: {
    text: "Total number of prescriptions",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) as cnt FROM prescription',
        '',
        'SELECT count(*) as cnt FROM prescription WHERE siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  numberLocations: {
    text: "Total number of locations",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) cnt FROM (SELECT id FROM site WHERE isActive=1 GROUP BY id) as sub',
        'SELECT count(*) cnt FROM (SELECT cc.siteId FROM user_copy c INNER JOIN patient_physio p on p.physioId = c.id INNER JOIN user_copy cc on cc.id = p.userId WHERE c.email = ' + db.get().escape(dataObj.user.email) + ' GROUP by cc.siteId) as sub',
        'SELECT count(*) cnt FROM (SELECT id FROM site WHERE isActive=1 AND id in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY id) as sub'
      ]);
    },
    result: function(rows) {
      return rows[0].cnt.toString();
    }
  },
  percentAgeFields: {
    text: "Percentage of age fields completed",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.no,
      payor: auth.no
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT 100*SUM(CASE WHEN dateOfBirth is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p WHERE (outcome is null OR outcome = "")',
        'SELECT 100*SUM(CASE WHEN dateOfBirth is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE (outcome is null OR outcome = "") AND u.email = ' + db.get().escape(dataObj.user.email),
        'SELECT 100*SUM(CASE WHEN dateOfBirth is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return rows[0].percent !== null ? rows[0].percent.toString() : 'NA';
    }
  },
  percentDiagnosisFields: {
    text: "Percentage of diagnosis fields completed",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.no,
      payor: auth.no
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT 100*SUM(CASE WHEN diagnosis is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p WHERE (outcome is null OR outcome = "")',
        'SELECT 100*SUM(CASE WHEN diagnosis is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE (outcome is null OR outcome = "") AND u.email = ' + db.get().escape(dataObj.user.email),
        'SELECT 100*SUM(CASE WHEN diagnosis is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return rows[0].percent !== null ? rows[0].percent.toString() : 'NA';
    }
  },
  percentOccupationFields: {
    text: "Percentage of occupation fields completed",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.no,
      payor: auth.no
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT 100*SUM(CASE WHEN occupation is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p WHERE (outcome is null OR outcome = "")',
        'SELECT 100*SUM(CASE WHEN occupation is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE (outcome is null OR outcome = "") AND u.email = ' + db.get().escape(dataObj.user.email),
        'SELECT 100*SUM(CASE WHEN occupation is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return rows[0].percent !== null ? rows[0].percent.toString() : 'NA';
    }
  },
  locations: {
    text: "Locations of devices and users",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    }
  },
  predictiveModel: {
    text: "The predictive model",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes
    }
  },
  averageExerciseFrequency: {
    text: "Average exercise frequency",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes
    }
  },

  /* distribution queries */

  distributionAge: {
    text: "Distribution of patients' ages",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy WHERE dateOfBirth is not null;',
        'SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE dateOfBirth is not null AND (outcome is null OR outcome = "") AND u.email = ' + db.get().escape(dataObj.user.email),
        'SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE dateOfBirth is not null AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return { title: "Age distribution", data: histogram(rows, ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-99"]) };
    }
  },
  distributionSex: {
    text: "Distribution of patients' sex",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT gender, count(*) as num FROM patient_info_copy WHERE gender is not null GROUP BY gender',
        'SELECT gender, count(*) as num FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE gender is not null AND (outcome is null OR outcome = "") AND u.email = ' + db.get().escape(dataObj.user.email) + ' GROUP BY gender',
        'SELECT gender, count(*) as num FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE gender is not null AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY gender'
      ]);
    },
    result: function(rows) {
      return {
        title: "Sex distribution",
        data: rows.map(function(v) {
          if (v.gender === 0) return { label: "Male", value: v.num };
          else return { label: "Female", value: v.num };
        })
      };
    }
  },
  distributionBMI: {
    text: "Distribution of patients' BMIs",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT weight/height*height as val from patient_info_copy where height is not null and weight is not null',
        'SELECT weight/height*height as val FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId where height is not null and weight is not null AND (outcome is null OR outcome = "") AND u.email = ' + db.get().escape(dataObj.user.email),
        'SELECT weight/height*height as val FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId where height is not null and weight is not null AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return { title: "BMI distribution", data: histogram(rows, ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44"]) };
    }
  },
  distributionHours: {
    text: "Distribution of hours of use",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'select hour(startDate)+minute(startDate)/60 as val from exercise_session',
        'select hour(startDate)+minute(startDate)/60 as val from exercise_session e INNER JOIN prescription p on p.id = e.prescriptionId INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE u.email = ' + db.get().escape(dataObj.user.email),
        'select hour(startDate)+minute(startDate)/60 as val from exercise_session e INNER JOIN prescription p on p.id = e.prescriptionId WHERE siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ')'
      ]);
    },
    result: function(rows) {
      return { title: "Usage hours", data: histogram(rows, ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]) };
    }
  },

  /* top 10 queries */

  sitesByPatients: {
    text: "The number of patients per site",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT CASE WHEN s.name IS NULL THEN 'Unknown site' ELSE s.name END as name, count(*) as value FROM user_copy u LEFT OUTER JOIN site s on s.id = u.siteId GROUP by s.name ORDER BY count(*) DESC",
        '',
        ''
      ]);
    },
    result: function(rows) {
      return {title: "Sites by patient", data:rows};
    }
  },
  prescriptionsByPatients: {
    text: "The number of patients per perscription",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT name, count(*) as value FROM prescription GROUP BY name ORDER BY count(*) DESC",
        "",
        ''
      ]);
    },
    result: function(rows) {
      return {title: "Prescriptions by patient", data:rows};
    }
  },
  physiosByNumberPatients: {
    text: "The number of patients per physio",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT CONCAT(firstName, ' ', lastName) as name, count(*) as value FROM patient_physio pp INNER JOIN user_copy u ON u.id = pp.physioId WHERE end_date is NULL GROUP BY physioId ORDER BY count(*) desc",
        "SELECT CONCAT(firstName, ' ', lastName) as name, count(*) as value FROM patient_physio pp INNER JOIN user_copy u ON u.id = pp.physioId WHERE end_date is NULL AND u.email = " + db.get().escape(dataObj.user.email) + " GROUP BY physioId ORDER BY count(*) desc",
        ''
      ]);
    },
    result: function(rows) {
      return {title: "Physios by patient", data:rows};
    }
  },
  physiosByOutcome: {
    text: "The number of succesful outcomes (as a percentage?) per physio",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        '',
        '',
        ''
      ]);
    },
    result: function(rows) {
      return {title: "Physios by outcome", data:rows};
    }
  },

  occupationsByPatients: {
    text: "The number of patients per physio",
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT CASE WHEN occupation IS NULL THEN 'Unknown' ELSE occupation END as name, count(*) as value FROM patient_info_copy GROUP BY occupation ORDER BY count(*) DESC",
        "",
        ""
      ]);
    },
    result: function(rows) {
      return {title: "Occupations by patient", data:rows};
    }
  },
  deviceByLoadFactor: {
    text: "Load factor of devices",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      var timeAvailable = 1000 * 60 * 60 * 8 * 20;
      var timePeriod = "INTERVAL 6 MONTH"; //see mysql DATE_SUB - http://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_date-sub
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT exerciseStationId, 100*SUM(re.duration)/(' + timeAvailable + ') as percent  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ' + timePeriod + ') GROUP BY exerciseStationId',
        '',
        'SELECT exerciseStationId, 100*SUM(re.duration)/(' + timeAvailable + ') as percent  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ' + timePeriod + ') AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY exerciseStationId'
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },
  deviceByBearingLife: {
    text: "Load factor of devices",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      var timeAvailable = 1000 * 60 * 60 * 8 * 20;
      var timePeriod = "INTERVAL 6 MONTH"; //see mysql DATE_SUB - http://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_date-sub
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT exerciseStationId, 100*SUM(re.duration)/(' + timeAvailable + ') as percent  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ' + timePeriod + ') GROUP BY exerciseStationId',
        '',
        'SELECT exerciseStationId, 100*SUM(re.duration)/(' + timeAvailable + ') as percent  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ' + timePeriod + ') AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY exerciseStationId'
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },
  deviceByCableLife: {
    text: "Load factor of devices",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      var timeAvailable = 1000 * 60 * 60 * 8 * 20;
      var timePeriod = "INTERVAL 6 MONTH"; //see mysql DATE_SUB - http://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_date-sub
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT exerciseStationId, 100*SUM(re.duration)/(' + timeAvailable + ') as percent  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ' + timePeriod + ') GROUP BY exerciseStationId',
        '',
        'SELECT exerciseStationId, 100*SUM(re.duration)/(' + timeAvailable + ') as percent  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ' + timePeriod + ') AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY exerciseStationId'
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },
  deviceByAvgSessionTime: {
    text: "Total device usage",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT exerciseStationId, SUM(re.duration) as duration FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId GROUP BY exerciseStationId',
        '',
        'SELECT exerciseStationId, SUM(re.duration) as duration FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY exerciseStationId'
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },
  mostCommonFaultByPatients: {
    text: "Most common reported fault",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT skipReason as reason, COUNT(*) as cnt FROM result_exercise WHERE skipReason IS NOT NULL GROUP BY skipReason ORDER BY COUNT(*) desc',
        '',
        'SELECT skipReason as reason, COUNT(*) as cnt FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId WHERE skipReason IS NOT NULL AND siteId in (' + db.get().escape(dataObj.user.sites.map(function(v) { return +v.id; })) + ') GROUP BY skipReason ORDER BY COUNT(*) desc'
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },

  /* unused?? */

  physiosByCostEffectiveOutcomes: {
    text: "Physios ranked by cost effectiveness",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        '',
        '',
        ''
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },
  providersByCostEffectiveOutcomes: {
    text: "Providers ranked by cost effectiveness",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        '',
        '',
        ''
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },

  sessionsToSuccess: {
    text: "Average number of sessions to successful outcome",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes
    },
    query: function(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT AVG(cnt) as mean, VARIANCE(cnt) as variance FROM (SELECT count(*) cnt FROM prescription p INNER JOIN exercise_session e on e.prescriptionId = p.id INNER JOIN patient_info_copy pic on pic.userId = p.userId WHERE outcome REGEXP '\\[OUTCOME\\][^\\[]+\\[/OUTCOME\\]' AND SUBSTRING_INDEX(SUBSTRING_INDEX(outcome,'[/OUTCOME]',1),'|',-1)=1 GROUP BY p.userId) sub",
        '',
        ''
      ]);
    },
    result: function(rows) {
      return rows;
    }
  },
  //implants in db?? recovery rate = outcome ??
  implantsByRecoveryRate: {
    text: "Implants ranked by recovery rate",
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes
    }
  },
};
