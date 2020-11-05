const { beforeEach, afterEach, describe, test } = require('@jest/globals');

const electronHostile = require('../');
const mock = require('mock-fs');
const sudo = require('sudo-prompt')

describe('removeHostsEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mock('sudo-prompt')
  })

  afterEach(() => {
    mock.restore();
  });

  test('removes single line', async () => {
    mock({
      '/etc/hosts': '102.100.100.199 asdasd.local',
    });

    await electronHostile.removeHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local'
      },
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('removes multiple lines', async () => {
    mock({
      '/etc/hosts': '102.100.100.199 asdasd.local\n102.100.100.198 asdasd2.local',
    });

    await electronHostile.removeHostsEntries([
      {
        ip: '102.100.100.199',
        host: 'asdasd.local'
      },
      {
        ip: '102.100.100.198',
        host: 'asdasd2.local'
      },
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "" > /etc/hosts', expect.any(Object), expect.any(Function))
  });

  test('removes multiple lines with the same host', async () => {
    mock({
      '/etc/hosts': '102.100.100.199 asdasd.local\n102.100.100.198 asdasd.local\n102.100.100.197 asdasd2.local\n102.100.100.196 asdasd2.local',
    });

    await electronHostile.removeHostsEntries([
      {
        host: 'asdasd.local'
      },
      {
        host: 'asdasd2.local'
      },
    ]);

    expect(sudo.exec).toHaveBeenCalledTimes(1)
    expect(sudo.exec).toHaveBeenCalledWith('echo "" > /etc/hosts', expect.any(Object), expect.any(Function))
  });
})
