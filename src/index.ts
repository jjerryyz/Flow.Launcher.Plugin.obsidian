import { exec } from 'node:child_process'
import { Glob } from 'bun'
import open from 'open'
import Fuse from 'fuse.js'
import { Flow } from './lib/flow'
import logger from './lib/logger'

// The events are the custom events that you define in the flow.on() method.
const events = ['search'] as const
type Events = (typeof events)[number]

const flow = new Flow<Events>()

flow.on('query', (params = []) => {
  const [query] = params as string[]

  if (!query)
    return flow.showInputHint()

  const commandList = [
    ['✨new drawing', 'obsidian://advanced-uri?vault=fuckBrain&commandid=obsidian-excalidraw-plugin%253Aexcalidraw-autocreate-newtab'],
    ['✨new note', 'obsidian://advanced-uri?vault=fuckBrain&commandid=quickadd%253Achoice%253A933f1787-0fc4-4200-9485-878c708429e8'],
    ['📅today', 'obsidian://advanced-uri?vault=fuckBrain&commandid=daily-notes'],
    ['✨add log', 'obsidian://advanced-uri?vault=fuckBrain&commandid=quickadd%253Achoice%253Af34d1258-cd59-46f3-83fa-1b4602d01fb7'],
    ['✨git-sync', 'git-sync'],
  ]

  const result: any[] = []
  commandList.forEach(([title, url]) => {
    if (title.includes(query)) {
      result.push({
        Title: title,
        Subtitle: '',
        JsonRPCAction: {
          method: 'search',
          parameters: [url],
          dontHideAfterAction: false,
        },
        ContextData: [],
        IcoPath: 'assets\\app.png',
        Score: 0,
      })
    }
  })

  try {
    const glob = new Glob('**/**/*')

    const files = []
    for (const file of glob.scanSync('D:/Obsidian/fuckBrain')) {
      if (file.startsWith('attachment'))
        continue
      files.push({ file, vault: 'fuckBrain' })
    }
    for (const file of glob.scanSync('D:/BaiduNetdiskWorkspace/Obsidian/private')) {
      if (file.startsWith('attachment'))
        continue
      files.push({ file, vault: 'private' })
    }

    const fuze = new Fuse(files, { keys: ['file'] })

    fuze.search(query).forEach(({ item }) => {
      logger.info('file', { file: item.file })
      result.push({
        Title: item.file.replace(/\\/g, '/'),
        Subtitle: '',
        JsonRPCAction: {
          method: 'search',
          parameters: [`obsidian://open?vault=${item.vault}&file=${encodeURIComponent(item.file)}`],
          dontHideAfterAction: false,
        },
        ContextData: [],
        IcoPath: 'assets\\app.png',
        Score: 0,
      })
    })

    console.log(JSON.stringify({ result }))
  }
  catch (error) {
    logger.error(error)
    return flow.showInputHint(JSON.stringify(error))
  }
})

flow.on('search', (params) => {
  // logger.info('Search', params)
  const [url] = params

  if (url === 'git-sync') {
    exec('git -C D://Obsidian//fuckBrain add .')
    exec('git -C D://Obsidian//fuckBrain commit -m  "sync"')
    exec('git -C D://Obsidian//fuckBrain push')
  }
  else if (url) {
    open(url as string)
  }
})

flow.run()
