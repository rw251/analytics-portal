const auth = require('./auth.js');
const db = require('./db.js');
const lookup = require('../controllers/lookup.js');
const lsoa = require('../controllers/lsoa.js');
const locations = require('./locations.js');

const GENDER = {
  MALE: 1,
  FEMALE: 0,
};

const q = function query(roles, role, yesUserSiteNone) {
  if (roles[role] === auth.yes) {
    return yesUserSiteNone[0];
  } else if (roles[role] === auth.byUser) {
    return yesUserSiteNone[1];
  } else if (roles[role] === auth.bySite) {
    return yesUserSiteNone[2];
  }
  return yesUserSiteNone[3];
};

const histogram = function histogram(data, categories) {
  const cats = categories.map(v => ({ label: v, lower: +(v.split('-')[0]), value: 0 }));
  data.forEach((v) => {
    for (let i = 0; i < cats.length; i += 1) {
      if (cats[i].lower > v.val) {
        cats[i - 1].value += 1;
        break;
      }
    }
  });
  return cats;
};

const sqlForListOfThings = function sqlForListOfThings(name, thingArray, thingLookupArray) {
  const returnSql = [];
  let things = thingArray;

  if (typeof things === 'string') {
    things = [things];
  }

  let findNullThing = false;
  const thingNames = [];

  things.forEach((v) => {
    if (thingLookupArray[+v].val === 'Unknown') {
      findNullThing = true;
    } else {
      thingNames.push(thingLookupArray[+v].val);
    }
  });

  if (findNullThing) {
    if (thingNames.length > 0) {
      returnSql.push(`AND (pi.${name} IS NULL OR pi.${name}='' OR pi.${name} IN ('${thingNames.join('\',\'')}'))`);
    } else {
      returnSql.push(`AND (pi.${name} IS NULL OR pi.${name}='')`);
    }
  } else {
    returnSql.push(`AND pi.${name} IN ('${thingNames.join('\',\'')}')`);
  }

  return returnSql;
};

const sqlFromParams = function sqlFromParams(params, lastUpdatedString, occupations, diagnoses) {
  // Situations where nothing will be returned
  const nullSQL = 'select id as complianceScore, name as doneProportion from site where name = \'blah\'';
  if (!params.sexMale && !params.sexFemale && !params.sexOther) {
    // No sex selected
    return nullSQL;
  }
  if (+params.ageFrom > +params.ageTo && !params.ageUnknown) {
    // Age from > age to and no unknown
    return nullSQL;
  }
  if (!params.occupations) {
    // No occupations selected
    return nullSQL;
  }

  let patientFilterSQL = [];
  if (params.ageUnknown) {
    const temp = [];
    if (params.ageFrom) {
      temp.push(`TIMESTAMPDIFF(YEAR,pi.dateOfBirth,'${lastUpdatedString}') >= ${params.ageFrom}`);
    }
    if (params.ageTo) {
      temp.push(`TIMESTAMPDIFF(YEAR,pi.dateOfBirth,'${lastUpdatedString}') <= ${params.ageTo}`);
    }
    patientFilterSQL.push(`AND (pi.dateOfBirth IS NULL OR ${temp.join(' AND ')})`);
  } else {
    if (params.ageFrom) {
      patientFilterSQL.push(`AND TIMESTAMPDIFF(YEAR,pi.dateOfBirth,'${lastUpdatedString}') >= ${params.ageFrom}`);
    }
    if (params.ageTo) {
      patientFilterSQL.push(`AND TIMESTAMPDIFF(YEAR,pi.dateOfBirth,'${lastUpdatedString}') <= ${params.ageTo}`);
    }
  }

  const sexesToInclude = [];

  if (params.sexMale) {
    sexesToInclude.push(`pi.gender = ${GENDER.MALE}`);
  }
  if (params.sexFemale) {
    sexesToInclude.push(`pi.gender = ${GENDER.FEMALE}`);
  }
  if (params.sexOther) {
    sexesToInclude.push('pi.gender IS NULL');
  }

  patientFilterSQL.push(`AND (${sexesToInclude.join(' OR ')})`);

  patientFilterSQL = patientFilterSQL.concat(sqlForListOfThings('occupation', params.occupations, occupations));
  patientFilterSQL = patientFilterSQL.concat(sqlForListOfThings('diagnosis', params.diagnoses, diagnoses));


  return patientFilterSQL.join(' ');
};

module.exports = {
  last_updated: {
    query() {
      return 'SELECT MAX(startDate) as last_updated FROM exercise_session';
    },
    result(rows) {
      return rows[0].last_updated;
    },
  },
  sidebar: {
    text: 'The sidebar',
    roles: {
      mujo: ['top10', 'locations', 'distributions', 'model'],
      operator: ['top10', 'distributions', 'model'],
      provider: ['top10', 'locations', 'distributions', 'model'],
      payor: ['top10', 'locations', 'distributions', 'model'],
    },
  },
  numberPatients: {
    text: 'Total number of patients',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT COUNT(*) cnt FROM patient_info_copy',
        `SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE u.email = ${db.get().escape(dataObj.user.email)}) as sub`,
        `SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId WHERE s.id in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})) as sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberActivePatients: {
    text: 'Total number of active patients',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT COUNT(*) cnt FROM patient_info_copy WHERE outcome IS NULL OR outcome=""',
        `SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId  WHERE (p.outcome IS NULL OR p.outcome="") AND u.email = ${db.get().escape(dataObj.user.email)}) as sub`,
        `SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId  WHERE (p.outcome IS NULL OR p.outcome="") AND s.id in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})) as sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberDischarged: {
    text: 'Total number of discharged patients',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT COUNT(*) cnt FROM patient_info_copy WHERE outcome IS NOT NULL AND outcome!=""',
        `SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId  WHERE (p.outcome IS NOT NULL AND p.outcome!="") AND u.email = ${db.get().escape(dataObj.user.email)}) as sub`,
        `SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId  WHERE (p.outcome IS NOT NULL AND p.outcome!="") AND s.id in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})) as sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberDischargedWithOutcome: {
    text: 'Total number of discharged patients given a certain outcome',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[/OUTCOME]',1),'|',-1) as outcum, count(*) as cnt FROM patient_info_copy WHERE notes REGEXP '\\\\[OUTCOME\\\\][0-9][^\\\\[]+\\\\[/OUTCOME\\\\]' GROUP BY outcum",
        '',
        `SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[/OUTCOME]',1),'|',-1) as outcum, count(*) as cnt FROM patient_info_copy WHERE notes REGEXP '\\\\[OUTCOME\\\\][0-9][^\\\\[]+\\\\[/OUTCOME\\\\]' AND userId IN (SELECT userId FROM prescription WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY userId) GROUP BY outcum`,
      ]);
    },
    result(rows) {
      const outcomes = ['', 'discharged with improvement', 'discharged without improvement', 'referred to surgery', 'failure'];
      const rtn = {};
      rows.forEach((v) => {
        rtn[outcomes[v.outcum]] = v.cnt;
      });
      return rtn;
    },
  },
  numberPhysios: {
    text: 'Total number of physios',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) as cnt FROM (SELECT c.id FROM user_copy c INNER JOIN user_role r on c.userRoleId=r.id WHERE LOWER(r.name)="physio" GROUP BY c.id) as sub',
        'SELECT count(*) as cnt FROM (SELECT c.id FROM user_copy c INNER JOIN user_role r on c.userRoleId=r.id WHERE LOWER(r.name)="physio" GROUP BY c.id) as sub',
        `SELECT count(*) as cnt FROM (SELECT c.id FROM user_copy c INNER JOIN user_role r on c.userRoleId=r.id WHERE LOWER(r.name)="physio" AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY c.id) as sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberTotalDiagnoses: {
    text: 'Total number of diagnoses',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) as cnt FROM patient_info_copy WHERE diagnosis is not null AND diagnosis != ""',
        `SELECT count(*) as cnt FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE diagnosis is not null AND diagnosis != "" AND email = ${db.get().escape(dataObj.user.email)})`,
        `SELECT count(*) as cnt FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE diagnosis is not null AND diagnosis != ""  AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberUniqueDiagnoses: {
    text: 'Total number of unique diagnoses',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) as cnt FROM (SELECT diagnosis FROM patient_info_copy WHERE diagnosis is not null AND diagnosis != "" GROUP BY diagnosis) as sub',
        `SELECT count(*) as cnt FROM (SELECT diagnosis FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE diagnosis is not null AND diagnosis != "" AND email = ${db.get().escape(dataObj.user.email)}) GROUP BY diagnosis) as sub`,
        `SELECT count(*) as cnt FROM (SELECT diagnosis FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE diagnosis is not null AND diagnosis != ""  AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY diagnosis) as sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberTotalPrescriptions: {
    text: 'Total number of prescriptions',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT count(*) as cnt FROM prescription WHERE name NOT LIKE '%rnal assess%'",
        '',
        `SELECT count(*) as cnt FROM prescription WHERE name NOT LIKE '%rnal assess%' AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberUniquePrescriptions: {
    text: 'Total number of unique prescriptions',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT COUNT(*) as cnt FROM (SELECT name FROM prescription WHERE name NOT LIKE '%rnal assess%' GROUP BY name) sub",
        '',
        `SELECT count(*) as cnt FROM (SELECT name FROM prescription WHERE name NOT LIKE '%rnal assess%' AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY name) sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  numberLocations: {
    text: 'Total number of locations',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT count(*) cnt FROM (SELECT id FROM site WHERE isActive=1 GROUP BY id) as sub',
        `SELECT count(*) cnt FROM (SELECT cc.siteId FROM user_copy c INNER JOIN patient_physio p on p.physioId = c.id INNER JOIN user_copy cc on cc.id = p.userId WHERE c.email = ${db.get().escape(dataObj.user.email)} GROUP by cc.siteId) as sub`,
        `SELECT count(*) cnt FROM (SELECT id FROM site WHERE isActive=1 AND id in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY id) as sub`,
      ]);
    },
    result(rows) {
      return rows[0].cnt.toString();
    },
  },
  percentAgeFields: {
    text: 'Percentage of age fields completed',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.no,
      payor: auth.no,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT 100*SUM(CASE WHEN dateOfBirth is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p WHERE (outcome is null OR outcome = "")',
        `SELECT 100*SUM(CASE WHEN dateOfBirth is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE (outcome is null OR outcome = "") AND u.email = ${db.get().escape(dataObj.user.email)}`,
        `SELECT 100*SUM(CASE WHEN dateOfBirth is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return rows[0].percent !== null ? rows[0].percent.toString() : 'NA';
    },
  },
  percentDiagnosisFields: {
    text: 'Percentage of diagnosis fields completed',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.no,
      payor: auth.no,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT 100*SUM(CASE WHEN diagnosis is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p WHERE (outcome is null OR outcome = "")',
        `SELECT 100*SUM(CASE WHEN diagnosis is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE (outcome is null OR outcome = "") AND u.email = ${db.get().escape(dataObj.user.email)}`,
        `SELECT 100*SUM(CASE WHEN diagnosis is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return rows[0].percent !== null ? rows[0].percent.toString() : 'NA';
    },
  },
  percentOccupationFields: {
    text: 'Percentage of occupation fields completed',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.no,
      payor: auth.no,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT 100*SUM(CASE WHEN occupation is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p WHERE (outcome is null OR outcome = "")',
        `SELECT 100*SUM(CASE WHEN occupation is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE (outcome is null OR outcome = "") AND u.email = ${db.get().escape(dataObj.user.email)}`,
        `SELECT 100*SUM(CASE WHEN occupation is null THEN 0 ELSE 1 END) / COUNT(*) as percent FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return rows[0].percent !== null ? rows[0].percent.toString() : 'NA';
    },
  },
  locations: {
    text: 'Locations of devices and users',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,

      /*  NATHAN
        MUMMY
        DADDY
        GRANDDAD
        GRANDMA
        AUNTIE ANNE
        UNCLE MICHAEL
        VIV
        YOGURT
        BIG YOGURT
        GRANDPA
        NANNA
        JOSHUA
        HELEN
        JOSHUA'S DADDY*/

    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "select SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[\\LSOA]',-1),'[/LSOA]',1) as lsoa from patient_info_copy WHERE notes REGEXP '\\\\[LSOA\\\\][^\\\\[]+\\\\[/LSOA\\\\]'",
        '',
        `select SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[\\LSOA]',-1),'[/LSOA]',1) as lsoa from patient_info_copy p INNER JOIN user_copy u ON u.id = p.userId WHERE notes REGEXP '\\\\[LSOA\\\\][^\\\\[]+\\\\[/LSOA\\\\]' AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows, callback) {
      /* const sites = [
        { pos: { lat: 51.514976, lng: -0.152516 }, name: 'Clinic 1', id: 1 },
        { pos: { lat: 51.544667, lng: -0.102851 }, name: 'Clinic 2', id: 2 },
        { pos: { lat: 51.584667, lng: -0.252851 }, name: 'Clinic 3', id: 3 },
        { pos: { lat: 51.541667, lng: 0.102851 }, name: 'Clinic 4', id: 4 },
      ];*/
      if (rows.length === 0) {
        lsoa.getList(locations.people,
          (err, list) => callback(null, { people: list, sites: locations.sites, real: false }));
      } else {
        lsoa.getList(rows.map(v => v.lsoa),
          (err, list) => callback(null, { people: list, sites: locations.sites, real: true }));
      }
    },
  },
  predictiveModel: {
    text: 'The predictive model',
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
  },
  averageExerciseFrequency: {
    text: 'Average exercise frequency',
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
  },

  /* distribution queries */

  distributionAge: {
    chart: {
      title: 'Age distribution',
      xTitle: 'Age (years)',
      yTitle: '# patients',
    },
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy WHERE dateOfBirth is not null;',
        `SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE dateOfBirth is not null AND (outcome is null OR outcome = "") AND u.email = ${db.get().escape(dataObj.user.email)}`,
        `SELECT (to_days(now()) - to_days(dateOfBirth))/365.25 as val FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE dateOfBirth is not null AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return { chart: this.chart, data: histogram(rows, ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']) };
    },
  },
  distributionSex: {
    text: "Distribution of patients' sex",
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT gender, count(*) as num FROM patient_info_copy WHERE gender is not null GROUP BY gender ORDER BY gender',
        `SELECT gender, count(*) as num FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE gender is not null AND (outcome is null OR outcome = "") AND u.email = ${db.get().escape(dataObj.user.email)} GROUP BY gender ORDER BY gender`,
        `SELECT gender, count(*) as num FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId WHERE gender is not null AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY gender ORDER BY gender`,
      ]);
    },
    result(rows) {
      return {
        title: 'Sex distribution',
        data: rows.map((v) => {
          // 0 is female and 1 is male. - email from Asim 8th November 2016
          if (v.gender === GENDER.MALE) return { label: 'Male', value: v.num, color: '#FF6384', highlight: '#FF6384' };
          return { label: 'Female', value: v.num, color: '#36A2EB', highlight: '#36A2EB' };
        }),
      };
    },
  },
  distributionBMI: {
    chart: {
      title: 'BMI distribution',
      xTitle: 'BMI',
      yTitle: '# patients',
    },
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT weight/height*height as val from patient_info_copy where height is not null and weight is not null',
        `SELECT weight/height*height as val FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId where height is not null and weight is not null AND (outcome is null OR outcome = "") AND u.email = ${db.get().escape(dataObj.user.email)}`,
        `SELECT weight/height*height as val FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId where height is not null and weight is not null AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return { chart: this.chart, data: histogram(rows, ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44']) };
    },
  },
  distributionHours: {
    chart: {
      title: 'Usage hours',
      xTitle: 'Time (24h clock)',
      yTitle: '# patients',
    },
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'select hour(startDate)+minute(startDate)/60 as val from exercise_session',
        `select hour(startDate)+minute(startDate)/60 as val from exercise_session e INNER JOIN prescription p on p.id = e.prescriptionId INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE u.email = ${db.get().escape(dataObj.user.email)}`,
        `select hour(startDate)+minute(startDate)/60 as val from exercise_session e INNER JOIN prescription p on p.id = e.prescriptionId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))})`,
      ]);
    },
    result(rows) {
      return { chart: this.chart, data: histogram(rows, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']) };
    },
  },

  distributionExerciseFrequencyPerDay: {
    chart: {
      title: 'Prescribed exercise frequency (per day)',
      xTitle: 'Sessions per day',
      yTitle: '# patients',
    },
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "select frequency as val FROM prescription p INNER JOIN user_copy u ON u.id = p.createdBy WHERE u.userRoleId=2 AND frequencyPeriod ='day' AND frequency is not null",
        "select frequency as val FROM prescription p INNER JOIN user_copy u ON u.id = p.createdBy WHERE u.userRoleId=2 AND frequencyPeriod ='day' AND frequency is not null",
        "select frequency as val FROM prescription p INNER JOIN user_copy u ON u.id = p.createdBy WHERE u.userRoleId=2 AND frequencyPeriod ='day' AND frequency is not null",
      ]);
    },
    result(rows) {
      return { chart: this.chart, data: histogram(rows, ['1', '2', '3', '4', '5', '6', '7', '8']) };
    },
  },

  distributionExerciseFrequencyPerWeek: {
    chart: {
      title: 'Prescribed exercise frequency (per week)',
      xTitle: 'Sessions per week',
      yTitle: '# patients',
    },
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "select frequency as val FROM prescription p INNER JOIN user_copy u ON u.id = p.createdBy WHERE u.userRoleId=2 AND frequencyPeriod ='week' AND frequency is not null",
        "select frequency as val FROM prescription p INNER JOIN user_copy u ON u.id = p.createdBy WHERE u.userRoleId=2 AND frequencyPeriod ='week' AND frequency is not null",
        "select frequency as val FROM prescription p INNER JOIN user_copy u ON u.id = p.createdBy WHERE u.userRoleId=2 AND frequencyPeriod ='week' AND frequency is not null",
      ]);
    },
    result(rows) {
      return { chart: this.chart, data: histogram(rows, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']) };
    },
  },

  /* top 10 queries */

  sitesByPatients: {
    text: 'The number of patients per site',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT CASE WHEN s.name IS NULL THEN 'Unknown site' ELSE s.name END as name, count(*) as value FROM patient_info_copy p INNER JOIN user_copy u on u.id = p.userId LEFT OUTER JOIN site s on s.id = u.siteId GROUP by s.name ORDER BY count(*) DESC",
        '',
        '',
      ]);
    },
    result(rows) {
      return { title: 'Sites by patient', data: rows };
    },
  },
  prescriptionsByPatients: {
    text: 'The number of patients per perscription',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT case when exerciseStationId = 1 and minElbowAngle=maxElbowAngle then CONCAT('Abduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 0 and minElbowAngle=maxElbowAngle then CONCAT('Adduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 1 and minShoulderAngle =maxShoulderAngle then CONCAT('External rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') when exerciseStationId = 0 and minShoulderAngle =maxShoulderAngle then CONCAT('Internal rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') else 'PNF' end as name2, count(*) as value FROM exercise e INNER JOIN prescription p ON e.prescriptionId = p.id WHERE p.name NOT LIKE 'External Assessment' AND p.name NOT LIKE 'Internal Assessment' GROUP BY name2 ORDER by COUNT(*) DESC",
        "SELECT case when exerciseStationId = 1 and minElbowAngle=maxElbowAngle then CONCAT('Abduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 0 and minElbowAngle=maxElbowAngle then CONCAT('Adduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 1 and minShoulderAngle =maxShoulderAngle then CONCAT('External rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') when exerciseStationId = 0 and minShoulderAngle =maxShoulderAngle then CONCAT('Internal rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') else 'PNF' end as name2, count(*) as value FROM exercise e INNER JOIN prescription p ON e.prescriptionId = p.id WHERE p.name NOT LIKE 'External Assessment' AND p.name NOT LIKE 'Internal Assessment' GROUP BY name2 ORDER by COUNT(*) DESC",
        '',
      ]);
    },
    result(rows) {
      // can't call the column "name" in the query due to a naming conflict so call
      // it name2 and fix here
      const rowsOutput = rows.map((v) => {
        const vv = v;
        vv.name = v.name2;
        delete vv.name2;
        return vv;
      });
      return { title: 'Prescriptions by patient', data: rowsOutput };
    },
  },
  assessmentsByPatients: {
    text: 'The number of patients per assessment',
    roles: {
      mujo: auth.yes,
      operator: auth.byUser,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT name, count(*) as value FROM prescription WHERE name LIKE '%rnal assess%' GROUP BY name ORDER BY count(*) DESC",
        `SELECT name, count(*) as value FROM prescription p INNER JOIN user_copy u on u.id = p.createdBy WHERE name LIKE '%rnal assess%' AND u.email = ${db.get().escape(dataObj.user.email)} GROUP BY name ORDER BY count(*) DESC`,
        '',
      ]);
    },
    result(rows) {
      return { title: 'Assessments by patient', data: rows };
    },
  },
  physiosByNumberPatients: {
    text: 'The number of patients per physio',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT CONCAT(firstName, ' ', lastName) as name, count(*) as value FROM patient_physio pp INNER JOIN user_copy u ON u.id = pp.physioId WHERE end_date is NULL GROUP BY physioId ORDER BY count(*) desc",
        `SELECT CONCAT(firstName, ' ', lastName) as name, count(*) as value FROM patient_physio pp INNER JOIN user_copy u ON u.id = pp.physioId WHERE end_date is NULL AND u.email = ${db.get().escape(dataObj.user.email)} GROUP BY physioId ORDER BY count(*) desc`,
        '',
      ]);
    },
    result(rows) {
      return { title: 'Physios by patient', data: rows };
    },
  },
  physiosByOutcome: {
    text: 'The number of succesful outcomes (as a percentage?) per physio',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT name, 100*COUNT(IF(outcome=1,1,NULL)) / COUNT(IF(outcome=2,1,NULL)) as value FROM (SELECT CONCAT(firstName, ' ', lastName) as name, SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[/OUTCOME]',1),'|',-1) as outcome from patient_info_copy pic    INNER JOIN patient_physio pp on pp.userId = pic.userId AND STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[OUTCOME]',-1),'|',1),'%d-%m-%Y') >= pp.start_date AND (pp.end_date is null OR STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[OUTCOME]',-1),'|',1),'%d-%m-%Y') <= pp.end_date) INNER JOIN user_copy u on u.id = pp.physioId WHERE notes REGEXP '\\\\[OUTCOME\\\\][0-9][^\\\\[]+\\\\[/OUTCOME\\\\]') sub GROUP BY name",
        '',
        `SELECT name, 100*COUNT(IF(outcome=1,1,NULL)) / COUNT(IF(outcome=2,1,NULL)) as value FROM (SELECT CONCAT(firstName, ' ', lastName) as name, SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[/OUTCOME]',1),'|',-1) as outcome from patient_info_copy pic    INNER JOIN patient_physio pp on pp.userId = pic.userId AND STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[OUTCOME]',-1),'|',1),'%d-%m-%Y') >= pp.start_date AND (pp.end_date is null OR STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[OUTCOME]',-1),'|',1),'%d-%m-%Y') <= pp.end_date) INNER JOIN user_copy u on u.id = pp.physioId WHERE notes REGEXP '\\\\[OUTCOME\\\\][0-9][^\\\\[]+\\\\[/OUTCOME\\\\]' AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) ) sub GROUP BY name`,
      ]);
    },
    result(rows) {
      return { title: 'Physios by outcome', data: rows };
    },
  },
  occupationsByPatients: {
    text: 'The number of patients per occupation',
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT CASE WHEN occupation IS NULL THEN 'Unknown' ELSE occupation END as name, count(*) as value FROM patient_info_copy GROUP BY occupation ORDER BY count(*) DESC",
        '',
        '',
      ]);
    },
    result(rows) {
      return { title: 'Occupations by patient', data: rows };
    },
  },
  deviceByLoadFactor: {
    text: 'Load factor of devices',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      const timeAvailable = 1000 * 60 * 60 * 8 * 20;
      const timePeriod = 'INTERVAL 6 MONTH'; // see mysql DATE_SUB - http://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_date-sub
      return q(this.roles, dataObj.user.roles[0], [
        `SELECT exerciseStationId as name, 100*SUM(re.duration)/(${timeAvailable}) as value  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ${timePeriod}) GROUP BY exerciseStationId`,
        '',
        `SELECT exerciseStationId as name, 100*SUM(re.duration)/(${timeAvailable}) as value  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE re.startTime > DATE_SUB(now(), ${timePeriod}) AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY exerciseStationId`,
      ]);
    },
    result(rows) {
      const rowsOutput = rows.map((v) => {
        const vv = v;
        vv.name = lookup.cache('ExerciseStation')[v.name];
        return vv;
      });
      return { title: 'Devices by load factor (% utilisation in last 6 months)', data: rowsOutput };
    },
  },
  deviceByBearingLife: {
    text: 'Devices by bearing life',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      const totalLife = 25000; // hours
      return q(this.roles, dataObj.user.roles[0], [
        `SELECT exerciseStationId as name, ${totalLife} - SUM(re.duration)/(1000*60*60) as value  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId GROUP BY exerciseStationId`,
        '',
        `SELECT exerciseStationId as name, ${totalLife} - SUM(re.duration)/(1000*60*60) as value  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY exerciseStationId`,
      ]);
    },
    result(rows) {
      const rowsOutput = rows.map((v) => {
        v.name = lookup.cache('ExerciseStation')[v.name];
        return v;
      });
      return { title: 'Devices by bearing life (hours remaining)', data: rowsOutput };
    },
  },
  deviceByCableLife: {
    text: 'Devices by cable life',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      const totalLife = 15000; // hours
      return q(this.roles, dataObj.user.roles[0], [
        `SELECT exerciseStationId as name, ${totalLife} - SUM(re.duration)/(1000*60*60) as value  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId GROUP BY exerciseStationId`,
        '',
        `SELECT exerciseStationId as name, ${totalLife} - SUM(re.duration)/(1000*60*60) as value  FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY exerciseStationId`,
      ]);
    },
    result(rows) {
      const rowsOutput = rows.map((v) => {
        v.name = lookup.cache('ExerciseStation')[v.name];
        return v;
      });
      return { title: 'Devices by cable life (hours remaining)', data: rowsOutput };
    },
  },
  deviceByAvgSessionTime: {
    text: 'Total device usage',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT exerciseStationId as name, SUM(re.duration)/(1000*60*COUNT(*)) as value FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId GROUP BY exerciseStationId',
        '',
        `SELECT exerciseStationId as name, SUM(re.duration)/(1000*60*COUNT(*)) as value FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId INNER JOIN exercise_session es on es.id = re.exerciseSessionId WHERE siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY exerciseStationId`,
      ]);
    },
    result(rows) {
      const rowsOutput = rows.map((v) => {
        v.name = lookup.cache('ExerciseStation')[v.name];
        return v;
      });
      return { title: 'Devices by average session time in minutes', data: rowsOutput };
    },
  },
  mostCommonFaultByPatients: {
    text: 'Most common reported fault',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.bySite,
      payor: auth.bySite,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        'SELECT skipReason as name, COUNT(*) as value FROM result_exercise WHERE skipReason IS NOT NULL GROUP BY skipReason ORDER BY COUNT(*) desc',
        '',
        `SELECT skipReason as name, COUNT(*) as value FROM result_exercise re INNER JOIN exercise e on e.id = re.exerciseId WHERE skipReason IS NOT NULL AND siteId in (${db.get().escape(dataObj.user.sites.map(v => +v.id))}) GROUP BY skipReason ORDER BY COUNT(*) desc`,
      ]);
    },
    result(rows) {
      const rowsOutput = rows.map((v) => {
        v.name = lookup.cache('SkipReason')[v.name];
        return v;
      });
      return { title: 'Most common failure reason', data: rowsOutput };
    },
  },

  /* unused?? */

  physiosByCostEffectiveOutcomes: {
    text: 'Physios ranked by cost effectiveness',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        '',
        '',
        '',
      ]);
    },
    result(rows) {
      return rows;
    },
  },
  providersByCostEffectiveOutcomes: {
    text: 'Providers ranked by cost effectiveness',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        '',
        '',
        '',
      ]);
    },
    result(rows) {
      return rows;
    },
  },

  sessionsToSuccess: {
    text: 'Average number of sessions to successful outcome',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes,
    },
    query(dataObj) {
      return q(this.roles, dataObj.user.roles[0], [
        "SELECT AVG(cnt) as mean, VARIANCE(cnt) as variance FROM (SELECT count(*) cnt FROM prescription p INNER JOIN exercise_session e on e.prescriptionId = p.id INNER JOIN patient_info_copy pic on pic.userId = p.userId WHERE notes REGEXP '\\\\[OUTCOME\\\\][0-9][^\\\\[]+\\\\[/OUTCOME\\\\]' AND SUBSTRING_INDEX(SUBSTRING_INDEX(notes,'[/OUTCOME]',1),'|',-1)=1 GROUP BY p.userId) sub",
        '',
        '',
      ]);
    },
    result(rows) {
      return rows;
    },
  },

  modelAverageCompliance: {
    text: 'Average compliance for a group of patients',
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.no,
      payor: auth.no,
    },
    query(dataObj) {
      const lastUpdatedString = dataObj.last_updated.toISOString().substr(0, 10);
      const filterSQL = sqlFromParams(dataObj.params, lastUpdatedString, dataObj.occupations,
        dataObj.diagnoses);

      return q(this.roles, dataObj.user.roles[0], [
        `SELECT p.complianceScore, count(*)/((case when frequencyPeriod = 'day' then 7*frequency else frequency end) * (datediff(case when p.endDate is null then '${lastUpdatedString}' else endDate end, p.startDate) + 1)/7) as doneProportion FROM prescription p inner join exercise_session es on es.prescriptionId = p.id INNER JOIN patient_info_copy pi ON pi.userId = p.userId WHERE frequency is not null AND es.startDate >= p.startDate AND es.startDate <= (case when p.endDate is null then '${lastUpdatedString}' else endDate end) ${filterSQL} GROUP BY p.id, p.userId,(case when frequencyPeriod = 'day' then 7*frequency else frequency end) * (datediff(case when p.endDate is null then '${lastUpdatedString}' else endDate end, p.startDate) + 1)/7, p.complianceScore`,
        `SELECT p.complianceScore, count(*)/((case when frequencyPeriod = 'day' then 7*frequency else frequency end) * (datediff(case when p.endDate is null then '${lastUpdatedString}' else endDate end, p.startDate) + 1)/7) as doneProportion FROM prescription p inner join exercise_session es on es.prescriptionId = p.id INNER JOIN patient_info_copy pi ON pi.userId = p.userId WHERE frequency is not null AND es.startDate >= p.startDate AND es.startDate <= (case when p.endDate is null then '${lastUpdatedString}' else endDate end) ${filterSQL} GROUP BY p.id, p.userId,(case when frequencyPeriod = 'day' then 7*frequency else frequency end) * (datediff(case when p.endDate is null then '${lastUpdatedString}' else endDate end, p.startDate) + 1)/7, p.complianceScore`,
        '',
      ]);
    },
    result(rows) {
      return rows;
    },
  },

  modelMostFreqPrescribedMotion: {
    text: 'Most frequenlty prescribed motions for a group of patients',
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.no,
      payor: auth.no,
    },
    query(dataObj) {
      const lastUpdatedString = dataObj.last_updated.toISOString().substr(0, 10);
      const filterSQL = sqlFromParams(dataObj.params, lastUpdatedString, dataObj.occupations,
        dataObj.diagnoses);

      return q(this.roles, dataObj.user.roles[0], [
        `SELECT case when exerciseStationId = 1 and minElbowAngle=maxElbowAngle then CONCAT('Abduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 0 and minElbowAngle=maxElbowAngle then CONCAT('Adduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 1 and minShoulderAngle =maxShoulderAngle then CONCAT('External rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') when exerciseStationId = 0 and minShoulderAngle =maxShoulderAngle then CONCAT('Internal rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') else 'PNF' end as name2, count(*) as value FROM exercise e INNER JOIN prescription p ON e.prescriptionId = p.id INNER JOIN patient_info_copy pi ON pi.userId = p.userId WHERE p.name NOT LIKE 'External Assessment' AND p.name NOT LIKE 'Internal Assessment' AND frequency is not null ${filterSQL} GROUP BY name2 ORDER by COUNT(*) DESC;`,
        `SELECT case when exerciseStationId = 1 and minElbowAngle=maxElbowAngle then CONCAT('Abduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 0 and minElbowAngle=maxElbowAngle then CONCAT('Adduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 1 and minShoulderAngle =maxShoulderAngle then CONCAT('External rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') when exerciseStationId = 0 and minShoulderAngle =maxShoulderAngle then CONCAT('Internal rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') else 'PNF' end as name2, count(*) as value FROM exercise e INNER JOIN prescription p ON e.prescriptionId = p.id INNER JOIN patient_info_copy pi ON pi.userId = p.userId WHERE p.name NOT LIKE 'External Assessment' AND p.name NOT LIKE 'Internal Assessment' AND frequency is not null ${filterSQL} GROUP BY name2 ORDER by COUNT(*) DESC;`,
        '',
      ]);
    },
    result(rows) {
      // can't call the column "name" in the query due to a naming conflict so call
      // it name2 and fix here
      const rowsOutput = rows.map((v) => {
        const vv = v;
        vv.name = v.name2;
        delete vv.name2;
        return vv;
      });
      return { title: 'Most frequently prescribed motions for this group', data: rowsOutput };
    },
  },

  modelMostFreqUsedAssessment: {
    text: 'Most frequenlty used assessment for a group of patients',
    roles: {
      mujo: auth.yes,
      operator: auth.yes,
      provider: auth.no,
      payor: auth.no,
    },
    query(dataObj) {
      const lastUpdatedString = dataObj.last_updated.toISOString().substr(0, 10);
      const filterSQL = sqlFromParams(dataObj.params, lastUpdatedString, dataObj.occupations,
        dataObj.diagnoses);

      return q(this.roles, dataObj.user.roles[0], [
        `SELECT case when exerciseStationId = 1 and minElbowAngle=maxElbowAngle then CONCAT('Abduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 0 and minElbowAngle=maxElbowAngle then CONCAT('Adduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 1 and minShoulderAngle =maxShoulderAngle then CONCAT('External rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') when exerciseStationId = 0 and minShoulderAngle =maxShoulderAngle then CONCAT('Internal rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') else 'PNF' end as name2, count(*) as value FROM exercise e INNER JOIN prescription p ON e.prescriptionId = p.id INNER JOIN patient_info_copy pi ON pi.userId = p.userId WHERE (p.name LIKE 'External Assessment' OR p.name LIKE 'Internal Assessment') ${filterSQL} GROUP BY name2 ORDER by COUNT(*) DESC;`,
        `SELECT case when exerciseStationId = 1 and minElbowAngle=maxElbowAngle then CONCAT('Abduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 0 and minElbowAngle=maxElbowAngle then CONCAT('Adduction at ',minElbowAngle,'° from ',minShoulderAngle,'° to ',maxShoulderAngle,'°')  when exerciseStationId = 1 and minShoulderAngle =maxShoulderAngle then CONCAT('External rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') when exerciseStationId = 0 and minShoulderAngle =maxShoulderAngle then CONCAT('Internal rotation at ',minShoulderAngle,'° from ',minElbowAngle,'° to ',maxElbowAngle,'°') else 'PNF' end as name2, count(*) as value FROM exercise e INNER JOIN prescription p ON e.prescriptionId = p.id INNER JOIN patient_info_copy pi ON pi.userId = p.userId WHERE (p.name LIKE 'External Assessment' OR p.name LIKE 'Internal Assessment') ${filterSQL} GROUP BY name2 ORDER by COUNT(*) DESC;`,
        '',
      ]);
    },
    result(rows) {
      // can't call the column "name" in the query due to a naming conflict so call
      // it name2 and fix here
      const rowsOutput = rows.map((v) => {
        const vv = v;
        vv.name = v.name2;
        delete vv.name2;
        return vv;
      });
      return { title: 'Most frequently used assessment for this group', data: rowsOutput };
    },
  },
  // implants in db?? recovery rate = outcome ??
  implantsByRecoveryRate: {
    text: 'Implants ranked by recovery rate',
    roles: {
      mujo: auth.yes,
      operator: auth.no,
      provider: auth.yes,
      payor: auth.yes,
    },
  },
};
