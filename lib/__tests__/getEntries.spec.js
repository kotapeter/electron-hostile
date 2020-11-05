const { afterEach, describe, test } = require('@jest/globals');

const electronHostile = require('../');
const mock = require('mock-fs');

describe('getEntries', () => {
  afterEach(() => {
    mock.restore();
  });

  test('returns an empty array if the file is empty', async () => {
    mock({
      '/etc/hosts': '',
    });

    const entries = await electronHostile.getEntries();

    expect(Array.isArray(entries) && entries.length === 0).toBeTruthy();
  });

  test('returns a single entry', async () => {
    mock({
      '/etc/hosts': '192.168.1.1 localhost',
    });

    const entries = await electronHostile.getEntries();

    expect(Array.isArray(entries) && entries.length === 1).toBeTruthy();
    expect(entries[0][0]).toBe('192.168.1.1')
    expect(entries[0][1]).toBe('localhost')
  });

  test('returns multiple entries', async () => {
    mock({
      '/etc/hosts': "192.168.1.1 localhost\n192.168.1.2 test.local",
    });

    const entries = await electronHostile.getEntries();

    expect(Array.isArray(entries) && entries.length === 2).toBeTruthy();
    expect(entries[0][0]).toBe('192.168.1.1')
    expect(entries[0][1]).toBe('localhost')
    expect(entries[1][0]).toBe('192.168.1.2')
    expect(entries[1][1]).toBe('test.local')
  });

  test('skips empty lines', async () => {
    mock({
      '/etc/hosts': "192.168.1.1 localhost\n\n\n\n\n192.168.1.2 test.local",
    });

    const entries = await electronHostile.getEntries();

    expect(Array.isArray(entries) && entries.length === 2).toBeTruthy();
    expect(entries[0][0]).toBe('192.168.1.1')
    expect(entries[0][1]).toBe('localhost')
    expect(entries[1][0]).toBe('192.168.1.2')
    expect(entries[1][1]).toBe('test.local')
  });

  test('skips comments', async () => {
    mock({
      '/etc/hosts': "192.168.1.1 localhost\n\n##This is a comment\n##This is another comment\n\n192.168.1.2 test.local",
    });

    const entries = await electronHostile.getEntries();

    expect(Array.isArray(entries) && entries.length === 2).toBeTruthy();
    expect(entries[0][0]).toBe('192.168.1.1')
    expect(entries[0][1]).toBe('localhost')
    expect(entries[1][0]).toBe('192.168.1.2')
    expect(entries[1][1]).toBe('test.local')
  });

  test('skips comments', async () => {
    mock({
      '/etc/hosts': "192.168.1.1 localhost\n\n##This is a comment\n##This is another comment\n\n192.168.1.2 test.local",
    });

    const entries = await electronHostile.getEntries();

    expect(Array.isArray(entries) && entries.length === 2).toBeTruthy();
    expect(entries[0][0]).toBe('192.168.1.1')
    expect(entries[0][1]).toBe('localhost')
    expect(entries[1][0]).toBe('192.168.1.2')
    expect(entries[1][1]).toBe('test.local')
  });

  test('returns all lines if preserveFormatting is true', async () => {
    mock({
      '/etc/hosts': "192.168.1.1 localhost\n\n##This is a comment\n##This is another comment\n\n192.168.1.2 test.local",
    });

    const entries = await electronHostile.getEntries(true);

    expect(Array.isArray(entries) && entries.length === 4).toBeTruthy();
    expect(entries[0][0]).toBe('192.168.1.1')
    expect(entries[0][1]).toBe('localhost')
    expect(entries[1][0]).toBe('##This is a comment')
    expect(entries[2][0]).toBe('##This is another comment')
    expect(entries[3][0]).toBe('192.168.1.2')
    expect(entries[3][1]).toBe('test.local')
  });
});
