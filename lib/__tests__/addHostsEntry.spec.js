const { beforeEach, afterEach, describe, test } = require('@jest/globals');

const electronHostile = require('../');
const mock = require('mock-fs');
const sudo = require('sudo-prompt')

describe('addHostsEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mock('sudo-prompt')
  })

  afterEach(() => {
    mock.restore();
  });

  test('add a single entry to an empty file', async () => {
    mock({
      '/etc/hosts': '',
    });

    await electronHostile.addHostsEntry('102.100.100.199', 'asdasd.local');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "102.100.100.199 asdasd.local" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add a single entry to a non-empty file', async () => {
    mock({
      '/etc/hosts': '11.11.11.11 test.local',
    });

    await electronHostile.addHostsEntry('100.100.100.199', 'asdasd.local');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "11.11.11.11 test.local\n100.100.100.199 asdasd.local" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add a single entry with wrapper to a non-empty file', async () => {
    mock({
      '/etc/hosts': '11.11.11.11 test.local',
    });

    await electronHostile.addHostsEntry('100.100.100.199', 'asdasd.local', 'TEST');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "11.11.11.11 test.local\n#### START TEST entries\n100.100.100.199 asdasd.local\n#### END TEST entries" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add a single entry with wrapper to an existing wrapper', async () => {
    mock({
      '/etc/hosts': "#### START TEST entries\n11.11.11.11 test.local\n#### END TEST entries",
    });

    await electronHostile.addHostsEntry('100.100.100.199', 'asdasd.local', 'TEST');

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "#### START TEST entries\n11.11.11.11 test.local\n100.100.100.199 asdasd.local\n#### END TEST entries" > /etc/hosts', expect.any(Object), expect.any(Function))
  });
})
