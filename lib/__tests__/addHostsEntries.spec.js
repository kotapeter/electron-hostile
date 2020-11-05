const { beforeEach, afterEach, describe, test } = require('@jest/globals');

const electronHostile = require('../');
const mock = require('mock-fs');
const sudo = require('sudo-prompt')

describe('addHostsEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mock('sudo-prompt')
  })

  afterEach(() => {
    mock.restore();
  });

  test('add multiple entries to an empty file', async () => {
    mock({
      '/etc/hosts': '',
    });

    await electronHostile.addHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local'
      },
      {
        ip: '102.100.100.198',
        host: 'asdasd2.local'
      }
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "102.100.100.199 asdasd.local\n102.100.100.198 asdasd2.local" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add multiple entries to a non-empty file', async () => {
    mock({
      '/etc/hosts': '1.1.1.1 test0.local',
    });

    await electronHostile.addHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local'
      },
      {
        ip: '102.100.100.198',
        host: 'asdasd2.local'
      }
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "1.1.1.1 test0.local\n102.100.100.199 asdasd.local\n102.100.100.198 asdasd2.local" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add multiple entries with wrapper to an empty file', async () => {
    mock({
      '/etc/hosts': '',
    });

    await electronHostile.addHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local',
        wrapper: 'TEST'
      },
      {
        ip: '102.100.100.198',
        host: 'asdasd2.local',
        wrapper: 'TEST'
      }
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "#### START TEST entries\n102.100.100.199 asdasd.local\n102.100.100.198 asdasd2.local\n#### END TEST entries" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add multiple entries with wrapper to a non-empty file', async () => {
    mock({
      '/etc/hosts': '1.1.1.1 test0.local',
    });

    await electronHostile.addHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local',
        wrapper: 'TEST'
      },
      {
        ip: '102.100.100.198',
        host: 'asdasd2.local',
        wrapper: 'TEST'
      }
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "1.1.1.1 test0.local\n#### START TEST entries\n102.100.100.199 asdasd.local\n102.100.100.198 asdasd2.local\n#### END TEST entries" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('add multiple entries with wrapper to an existing wrapper', async () => {
    mock({
      '/etc/hosts': '#### START TEST entries\n1.1.1.1 test0.local\n#### END TEST entries',
    });

    await electronHostile.addHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local',
        wrapper: 'TEST'
      },
      {
        ip: '102.100.100.198',
        host: 'asdasd2.local',
        wrapper: 'TEST'
      }
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "#### START TEST entries\n1.1.1.1 test0.local\n102.100.100.199 asdasd.local\n102.100.100.198 asdasd2.local\n#### END TEST entries" > /etc/hosts', expect.any(Object), expect.any(Function))
  });
})
