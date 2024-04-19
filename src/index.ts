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
    ['✨new canvas', 'obsidian://advanced-uri?vault=fuckBrain&commandid=canvas%253Anew-file'],
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
    for (const file of glob.scanSync('D:/Obsidian/private')) {
      if (file.startsWith('attachment'))
        continue
      files.push({ file, vault: 'private' })
    }

    const fuze = new Fuse(files, { keys: ['file'] })

    fuze.search(query).forEach(({ item }) => {
      result.push({
        Title: item.file.replace(/\\/, '/'),
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
  logger.info('Search', params)
  const [url] = params

  if (url)
    open(url as string)
})

flow.run()
