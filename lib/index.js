const fs = require('fs');
const split = require('split');
const through = require('through');
const sudoExec = require('./utils/sudoExec');
const addLine = require('./utils/addLine')
const removeLine = require('./utils/removeLine')

const WINDOWS = process.platform === 'win32';
const EOL = WINDOWS
  ? ''
  : '\n';

const PATH = WINDOWS
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts';

const getEntries = (preserveFormatting) => {
  const lines = [];

  const online = (line) => {
    // Remove all comment text from the line
    const lineSansComments = line.replace(/#.*/, '');
    const matches = /^\s*?(.+?)\s+(.+?)\s*$/.exec(lineSansComments);
    if (matches && matches.length === 3) {
      // Found a hosts entry
      const ip = matches[1];
      const host = matches[2];
      lines.push([ip, host]);
    } else {
      // Found a comment, blank line, or something else
      if (preserveFormatting && line !== '') {
        lines.push([line]);
      }
    }
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(PATH, { encoding: 'utf8' })
    .pipe(split())
    .pipe(through(online))
    .on('close', () => resolve(lines))
    .on('error', reject);
  });
};

const addHostsEntry = async (ip, host, wrapperName = '', sudoOptions = {}) => {
  const currentLines = await getEntries(true)

  const lines = addLine(currentLines, { ip, host }, wrapperName)

  return writeFile(lines, sudoOptions);
};

const addHostsEntries = async (entries, sudoOptions = {}) => {
  let lines = await getEntries(true)

  entries.forEach(entry => lines = addLine(lines, entry, entry.wrapper))

  return writeFile(lines, sudoOptions);
}

const removeHostsEntry = async (host, ip, sudoOptions = {}) => {
  const lines = (await getEntries(true)).filter(line => {
    return !(Array.isArray(line) && (!ip || line[0] === ip) && line[1] === host);
  });

  return writeFile(lines, sudoOptions);
};

const removeHostsEntries = async (entries, sudoOptions = {}) => {
  let lines = await getEntries(true)

  entries.forEach(entry => lines = removeLine(lines, entry.host, entry.ip))

  return writeFile(lines, sudoOptions)
}

const writeFile = async (lines, sudoOptions = {}) => {
  lines = lines.map(function(line, lineNum) {
    if (Array.isArray(line) && line[0] && line[1]) {
      line = line[0] + ' ' + line[1];
    }
    return line + (lineNum === lines.length - 1 ? '' : EOL);
  });

  if (WINDOWS) {
    const hostsString = lines.map((line, index) => `echo ${line} >${index ? '>' : ''} ${PATH}`).join(' & echo. & ')
    return sudoExec(`${hostsString}`, sudoOptions);
  } else {
    return sudoExec(`echo "${lines.join('')}" > ${PATH}`, sudoOptions);
  }
};

module.exports = {
  getEntries,
  addHostsEntry,
  addHostsEntries,
  removeHostsEntry,
  removeHostsEntries,
};

