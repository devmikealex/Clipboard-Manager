import fs from 'fs'
import path from 'path'
import clipboardy from 'clipboardy'
import readline from 'readline'

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

const clipsDir = path.join(process.cwd(), 'clips')

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)

let files = []

function showMenu() {
    console.clear()
    console.log('=== Clips Menu ===')

    const letters = 'abcdefghijklmnopqrstuvwxyz'

    files.forEach((file, i) => {
        let key
        if (i < 9) key = String(i + 1) // 1..9
        else if (i === 9) key = '0' // 0
        else key = letters[i - 10] || '?' // a, b, c...

        // console.log(`${key}. ${file}`)
        console.log(`  ${key}. ${path.parse(file).name}`)
    })

    console.log('')
    console.log('  r. Refresh files')
    console.log('  q. Quit')
}

function handleKey(str, key) {
    if (key.name === 'q') {
        process.exit(0)
    } else if (key.name === 'r') {
        loadFiles()
    } else {
        let index = -1

        if (/^[1-9]$/.test(str)) {
            index = parseInt(str, 10) - 1
        } else if (str === '0') {
            index = 9
        } else {
            const pos = LETTERS.indexOf(str.toLowerCase())
            if (pos !== -1) index = pos + 10
        }

        if (files[index]) {
            const filePath = path.join(clipsDir, files[index])
            const content = fs.readFileSync(filePath, 'utf-8')
            console.clear()
            console.log(`Copied: ${files[index]}\n`)
            setTimeout(showMenu, 1500)
            clipboardy.writeSync(content)
        }
    }
}

function loadFiles() {
    try {
        files = fs
            .readdirSync(clipsDir)
            .filter((f) => fs.statSync(path.join(clipsDir, f)).isFile())
    } catch {
        console.error('Error reading clips directory.')
        process.exit(1)
    }
    showMenu()
}

process.stdin.on('keypress', handleKey)
loadFiles()
