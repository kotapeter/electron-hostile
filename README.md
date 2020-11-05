[![kotapeter](https://circleci.com/gh/kotapeter/electron-hostile.svg?style=shield)](<https://app.circleci.com/pipelines/github/kotapeter/electron-hostile>)

# electron-hostile

This package is inspired by hostile. In an electron app usually we need to get a confirmation from the user.
When you add/delete an entry to/from hosts file user will get a confirmation box (mac: password, win: confirm)

### Get all entries

``` javascript
import { getEntries } from 'electron-hostile'

// returns entries without comments
const entries = await getEntries()

// returns all entries with comments
const entries = await getEntries(true)
```

### Add new entry
``` javascript
import { addHostsEntry, addHostsEntries } from 'electron-hostile'

// add single entry
await addHostsEntry('100.100.100.100', 'mysite.local', 'WRAPPER', { name: 'MYAPP', icon: '/static/img.png' })

// add multiple entries
await addHostsEntries([
  { ip: '1.1.1.1', host: 'site1.local', wrapper: 'TEST' },
  { ip: '1.1.1.1', host: 'www.site1.local', wrapper: 'TEST' },
], { name: 'MYAPP', icon: '/static/img.png' })
```

### Remove entry
``` javascript
import { removeHostsEntry, removeHostsEntries } from 'electron-hostile'

// remove single entry
await removeHostsEntry('mysite.local', { name: 'MYAPP', icon: '/static/img.png' })

// add multiple entries
await removeHostsEntries([
  { ip: '1.1.1.1', host: 'site1.local' },
  { ip: '1.1.1.1', host: 'www.site1.local' },
], { name: 'MYAPP', icon: '/static/img.png' })
```
