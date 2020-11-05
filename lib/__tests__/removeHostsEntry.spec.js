const { beforeEach, afterEach, describe, test } = require('@jest/globals');

const electronHostile = require('../');
const mock = require('mock-fs');
const sudo = require('sudo-prompt')

describe('removeHostsEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mock('sudo-prompt')
  })

  afterEach(() => {
    mock.restore();
  });

  test('remove a single line by host', async () => {
    mock({
      '/etc/hosts': '1.1.1.1 asdasd.local',
    });

    await electronHostile.removeHostsEntry('asdasd.local');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('remove a single line by host and ip', async () => {
    mock({
      '/etc/hosts': '1.1.1.1 asdasd.local',
    });

    await electronHostile.removeHostsEntry('asdasd.local', '1.1.1.1');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('shouldn\'t remove if ips are not matching', async () => {
    mock({
      '/etc/hosts': '1.1.1.2 asdasd.local',
    });

    await electronHostile.removeHostsEntry('asdasd.local', '1.1.1.1');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "1.1.1.2 asdasd.local" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('removes line from wrapper', async () => {
    mock({
      '/etc/hosts': '#### START TEST entries\n1.1.1.2 asdasd.local\n#### END TEST entries',
    });

    await electronHostile.removeHostsEntry('asdasd.local', '1.1.1.2');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "#### START TEST entries\n#### END TEST entries" > /etc/hosts', expect.any(Object), expect.any(Function))
  });
})
