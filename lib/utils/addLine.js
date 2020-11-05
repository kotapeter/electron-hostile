const net = require('net');

module.exports = (currentLines, { ip, host }, wrapperName) => {
  let hasWrapper = false;
  let wrapperIndex = 0;

  const lines = currentLines.map((line, index) => {
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

  return lines;
};
