const $ = require('jquery');
const sidebar = require('./components/sidebar.js');
const stats = require('simple-statistics');
const data = require('../data');
const modelTmpl = require('../templates/model.jade');
const waitingTmpl = require('../templates/waiting.jade');
const modelOutputTmpl = require('../templates/model-output.jade');

const portal = {

  show() {
    data.getModelDefaults((defaults) => {
      if (location.hash.replace('#', '') !== 'model') {
        // user has tabbed away so ignore
        return;
      }

      const html = modelTmpl(defaults);

      $('#page').fadeOut(1000, function fadeOut() {
        $(this).html(html).fadeIn(1000);
        portal.wireup();
      });
    });


    const html = waitingTmpl();

    $('#page').html(html);
    $('#toggle-button').removeClass('home-screen');

    $('.navbar-brand').removeClass('selected');
    $('.navbar-brand[href*=portal]').addClass('selected');

    sidebar.show();
  },

  wireup() {
    $('form').on('submit', function submit(e) {
      // First disable and rename button
      $('button').prop('disabled', true).text('Generating...');

      $('#output').html(waitingTmpl());
      const values = {};
      $.each($(this).serializeArray(), (i, field) => {
        values[field.name] = field.value;
      });
      console.log(values);

      $.ajax({
        type: 'POST',
        url: '/api/model',
        data: JSON.stringify(values),
        dataType: 'json',
        contentType: 'application/json',
      })
        .done((d) => {
          const doneProportions = d.map(v => v.doneProportion);
          const complianceScores = d.map(v => v.complianceScore);

          const modelOutputData = {
            sampleSize: d.length,
            outcomes: [
              {
                name: 'Session frequency compliance',
                mean: stats.mean(doneProportions),
                sd: stats.standardDeviation(doneProportions),
              },
              {
                name: 'Overall compliance',
                mean: stats.mean(complianceScores),
                sd: stats.standardDeviation(complianceScores),
              },
            ],
          };

          const html = modelOutputTmpl(modelOutputData);

          $('#output').fadeOut(1000, function fadeOut() {
            $('button').prop('disabled', false).text('Generate');
            $(this).html(html).fadeIn(1000);
          });
        })
        .fail(() => {
          $('#output').fadeOut(1000, () => {
            $('button').prop('disabled', false).text('Generate');
          });
        });

      e.preventDefault();
    });
  },

};

module.exports = portal;
