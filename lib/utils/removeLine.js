module.exports = (currentLines, host, ip) => {
  return currentLines.filter(line => {
    return !(Array.isArray(line) && (!ip || line[0] === ip) && line[1] === host);
  });
};
