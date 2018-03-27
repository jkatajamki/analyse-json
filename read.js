const fs = require('fs');
const path = require('path');

const promiseFile = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, res) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(res);
  });
});

const parseJson = (strValue) => {
  try {
    return JSON.parse(strValue);
  } catch (e) {
    console.error('Error parsing string:', e);
    process.exit(1);
  }
};

const getPath = (pathArg) => pathArg.charAt(0) === '/' ? pathArg : path.resolve(__dirname, pathArg);

const readFile = async (pathArg) => {
  const filepath = getPath(pathArg);
  try {
    const strValue = await promiseFile(filepath);
    return parseJson(strValue);
  } catch (e) {
    console.error('Error reading file', e);
    process.exit(1);
  }
};

const analyse = (ob, key) => {
  try {
    if (Array.isArray(ob)) {
      console.log('Object', key, 'is an array containing', ob.length, 'elements');
      return ob.map(row => analyse(row, 'index ' + ob.indexOf(row)));
    } else if (!!ob && typeof ob === 'object') {
      const keys = Object.keys(ob);
      console.log('Object', key, 'is an object containing', keys.length, 'properties');
      return keys.map(obKey => analyse(ob[obKey], obKey));
    } else {
      console.log('Object', key, 'is', typeof ob);
    }
  } catch (e) {
    console.error('Error analysing ob', ob, 'with key', key, ' - ', e);
  }
};

const getArg = () => {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Must provide filepath as argument');
    process.exit(1);
  }
  return arg;
};

(async () => {
  const filepath = getArg();
  const data = await readFile(filepath);
  analyse(data, 'root');

  process.exit(0);
})();
