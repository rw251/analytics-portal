var p = require('../../../server/db/permissions'),
  expect = require("chai").expect,
  db = require('../../../server/db/db');

describe('Permision Tests', function() {

  before(function(done) {
    db.fakeDB(done);
  });

  it("Gets last_updated sql", function() {
    expect(p.last_updated.query({ user: { email: 'mail', roles: ['mujo'] } })).to.equal('SELECT MAX(startDate) as last_updated FROM exercise_session');
    expect(p.last_updated.result([{ last_updated: "test" }])).to.equal("test");
  });

  it("Gets numberPatients sql", function() {
    expect(p.numberPatients.query({ user: { email: 'mail', roles: ['mujo'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM patient_info_copy');
    expect(p.numberPatients.query({ user: { email: 'mail', roles: ['operator'], sites: [{ id: '1' }] } })).to.equal("SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId WHERE u.email = 'mail') as sub");
    expect(p.numberPatients.query({ user: { email: 'mail', roles: ['provider'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId WHERE s.id in (1)) as sub');

    expect(p.numberPatients.result([{ cnt: "test" }])).to.equal("test");
  });

  it("Gets numberActivePatients sql", function() {
    expect(p.numberActivePatients.query({ user: { email: 'mail', roles: ['mujo'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM patient_info_copy WHERE outcome IS NULL OR outcome=""');
    expect(p.numberActivePatients.query({ user: { email: 'mail', roles: ['operator'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId  WHERE (p.outcome IS NULL OR p.outcome="") AND u.email = \'mail\') as sub');
    expect(p.numberActivePatients.query({ user: { email: 'mail', roles: ['provider'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId  WHERE (p.outcome IS NULL OR p.outcome="") AND s.id in (1)) as sub');

    expect(p.numberActivePatients.result([{ cnt: "test" }])).to.equal("test");
  });

  it("Gets numberDischarged sql", function() {
    expect(p.numberDischarged.query({ user: { email: 'mail', roles: ['mujo'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM patient_info_copy WHERE outcome IS NOT NULL AND outcome!=""');
    expect(p.numberDischarged.query({ user: { email: 'mail', roles: ['operator'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN patient_physio pp on pp.userId = p.userId INNER JOIN user_copy u on u.id = pp.physioId  WHERE (p.outcome IS NOT NULL AND p.outcome!="") AND u.email = \'mail\') as sub');
    expect(p.numberDischarged.query({ user: { email: 'mail', roles: ['provider'], sites: [{ id: '1' }] } })).to.equal('SELECT COUNT(*) cnt FROM (SELECT DISTINCT p.userId FROM patient_info_copy p INNER JOIN prescription rx on rx.userId = p.userId INNER JOIN site s on s.id = rx.siteId  WHERE (p.outcome IS NOT NULL AND p.outcome!="") AND s.id in (1)) as sub');

    expect(p.numberDischarged.result([{ cnt: "test" }])).to.equal("test");
  });

});
