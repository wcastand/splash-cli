
// Modules
const ProgressBar = require('progress');
const colors = require('colors');
const wallpaper = require('wallpaper');
const https = require('https');
const splash = require('../libs/core');
const path = require('path');
const fs = require('fs');
const Ora = require('ora');
const Conf = require('conf');


// Variables
const config = new Conf();
const spinner = new Ora({ text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth' });
const join = path.join;
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiUrl = `https://api.unsplash.com/photos/random?client_id=${token}`;
const log = console.log;


// Functions
function infos(matrice, fl) {
  const creator = {
    fullname: matrice.user.name,
    username: `@${matrice.user.username}`,
  };

  if (fl.info) {
    log('');
    log(`ID: ${matrice.id.yellow}`);
    log('');

    if (matrice.exif !== undefined) {
      if (matrice.exif.make) {
        log('Make: '.yellow.bold + matrice.exif.make);
      } else {
        log(`${'Make: '.yellow.bold}--`);
      }
      if (matrice.exif.model) {
        log('Model: '.yellow.bold + matrice.exif.model);
      } else {
        log(`${'Model: '.yellow.bold}--`);
      }
      if (matrice.exif.exposure_time) {
        log('Shutter Speed: '.yellow.bold + matrice.exif.exposure_time);
      } else {
        log(`${'Shutter Speed: '.yellow.bold}--`);
      }
      if (matrice.exif.aperture) {
        log(`${'Aperture:'.yellow.bold} f/${matrice.exif.aperture}`);
      } else {
        log(`${'Aperture: '.yellow.bold} f/--`);
      }
      if (matrice.exif.focal_length) {
        log(`${'Focal Length: '.yellow.bold + matrice.exif.focal_length}mm`);
      } else {
        log(`${'Focal Length: '.yellow.bold}--`);
      }
      if (matrice.exif.iso) {
        log('ISO: '.yellow.bold + matrice.exif.iso);
      } else {
        log(`${'ISO: '.yellow.bold}--`);
      }
    }
    log('');
    log(`Shooted by: ${creator.fullname.cyan.bold} (${creator.username.yellow})`);
    log(`Profile URL: ${matrice.user.links.html}`);
  } else {
    log('');
    log(`Shooted by: ${creator.fullname.cyan.bold} (${creator.username.yellow})`);
  }
}

function down(filename, url, m, fl) {
  spinner.spinner = {
    frames: [
      '🚀',
    ],
  };
  spinner.text = ' Making something awsome';

  if (!fl.progress) {
    spinner.start();
  }

  const file = fs.createWriteStream(filename);

  https.get(url, (response) => {
    if (fl.progress) {
      const len = parseInt(response.headers['content-length'], 10);
      const bar = new ProgressBar(`${'↓ '.yellow + ':percent'.red} [:bar] :elapsed s`, {
        complete: '#',
        incomplete: ' ',
        total: len,
        width: 15,
        clear: true,
      });

      response.on('data', (chunk) => {
        bar.tick(chunk.length, {
          passphrase: 'Making something awsome',
        });
      });
    }

    response.pipe(file).on('finish', () => {
      spinner.succeed();
      if (fl.set) {
        wallpaper.set(filename);
      }

      infos(m, fl);

      log('');
    });
  });
}


// Init
module.exports = (fl) => {
  let url = '';

  if (fl.heigth && fl.width) {
    url = `${apiUrl}&&w=${fl.width}&&h=${fl.heigth}`;
  } else if (fl.user) {
    url = `${apiUrl}&&username=${fl.user}`;
  } else if (fl.featured) {
    url = `${apiUrl}&&featured=${fl.featured}`;
  } else if (fl.collection) {
    url = `${apiUrl}&&collection=${fl.collection}`;
  } else {
    url = `${apiUrl}`;
  }

  splash(url, (data, photo) => {
    const directory = (fl.save.length) ? join(fl.save, `${data.name}.jpg`) : join(config.get('pic_dir'), `${data.name}.jpg`);
    down(directory, data.url, photo, fl);
  });

  log();
  log(`${colors.yellow('Splash:')} Photo saved at ${fl.save}`);
  log();
};
