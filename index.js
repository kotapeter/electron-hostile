const fs = require('fs');
const split = require('split');
const through = require('through');
const sudo = require('sudo-prompt');
const net = require('net');

const WINDOWS = process.platform === 'win32';
const EOL = WINDOWS
  ? '\r\n'
  : '\n';

const PATH = WINDOWS
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts';

const sudoExec = (args, options = {}) => {
  return new Promise((resolve, reject) => {
    sudo.exec(
      args,
      options,
      (error, stdout) => {
        if (error) {
          reject(new Error(`Encountered an error: ${error}`));
        } else {
          resolve(stdout);
        }
      }
    );
  });
};

const getEntries = (preserveFormatting) => {
  const lines = [];

  const online = (line) => {
    console.log(line);
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

const set = async (ip, host, wrapperName = '') => {
  // Try to update entry, if host already exists in file
  let hasWrapper = false;
  let wrapperIndex = 0;

  const lines = (await getEntries(true)).map((line, index) => {
    // replace a line if both hostname and ip version of the address matches
    if (Array.isArray(line) && line[1] === host && net.isIP(line[0]) === net.isIP(ip)) {
      line[0] = ip;
    }
    if (Array.isArray(line) && line.length === 1 && wrapperName && line[0].includes(`END ${wrapperName} entries`)) {
      hasWrapper = true;
      wrapperIndex = index;
    }
    return line;
  });

  // If entry did not exist, let's add it
  // If the last line is empty, or just whitespace, then insert the new entry
  // right before it
  const lastLine = lines[lines.length - 1];
  if (wrapperName && hasWrapper) {
    console.log(wrapperIndex);
    lines.splice(wrapperIndex, 0, [ip, host]);
  } else if (wrapperName && !hasWrapper) {
    if (typeof lastLine === 'string' && /\s*/.test(lastLine)) {
      lines.splice(lastLine, 0, [`#### START ${wrapperName} entries`]);
      lines.splice(lastLine, 0, [ip, host]);
      lines.splice(lastLine, 0, [`#### END ${wrapperName} entries`]);
    } else {
      lines.push([`#### START ${wrapperName} entries`]);
      lines.push([ip, host]);
      lines.push([`#### END ${wrapperName} entries`]);
    }
  } else {
    if (typeof lastLine === 'string' && /\s*/.test(lastLine)) {
      lines.splice(lastLine - 1, 0, [ip, host]);
    } else {
      lines.push([ip, host]);
    }
  }

  return writeFile(lines);
};

const remove = async (host, ip) => {
  const lines = (await getEntries(true)).filter(line => {
    return !(Array.isArray(line) && (!ip || line[0] === ip) && line[1] === host);
  });

  return writeFile(lines);
};

const writeFile = async (lines) => {
  lines = lines.map(function(line, lineNum) {
    if (Array.isArray(line) && line[0] && line[1]) {
      line = line[0] + ' ' + line[1];
    }
    return line + (lineNum === lines.length - 1 ? '' : EOL);
  });

  return sudoExec(`echo "${lines.join('')}" > ${PATH}`);
};

module.exports = {
  getEntries,
  set,
  remove
};

