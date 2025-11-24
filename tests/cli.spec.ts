import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as fs from 'fs-plus'
import * as path from 'path'
import { execSync } from 'child_process'
import * as os from 'os'

describe('CLI end-to-end tests', () => {
    let tempDir: string
    let sourcePath: string
    let targetPath: string
    const cliPath = path.resolve(__dirname, '../dist/lib/index.js')

    beforeAll(() => {
        // Create a temporary directory for testing
        tempDir = path.join(os.tmpdir(), `vue-svgicon-test-${Date.now()}`)
        sourcePath = path.join(tempDir, 'src/assets/icons')
        targetPath = path.join(tempDir, 'src/assets/icons/compiled')

        // Create the source directory
        fs.makeTreeSync(sourcePath)
    })

    afterAll(() => {
        // Clean up the temporary directory
        if (fs.existsSync(tempDir)) {
            fs.removeSync(tempDir)
        }
    })

    it('should convert SVG file to ES6 module with correct output', () => {
        // Input SVG content
        const inputSvg = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px"
\t height="24px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
<g id="Line_Icons">
\t<g>
\t\t<polygon style="fill:#000;" points="9,15.002 7,13.002 4,17.002 14,17.002 11,11.002 \t\t"/>
\t\t<circle style="fill:#000;" cx="7" cy="10.002" r="2"/>
\t\t<path style="fill:#000;" d="M2,2.001h10v4h4l0,8.001h2V4.587l-4.586-4.586H2c-1.103,0-2,0.897-2,2v18c0,1.103,0.897,2,2,2h12
\t\t\tv-2H2V2.001z"/>
\t\t<polygon style="fill:#000;" points="21,19 21,16 19,16 19,19 16,19 16,21 19,21 19,24 21,24 21,21 24,21 24,19 \t\t"/>
\t</g>
</g>
</svg>`

        const expectedOutput = `/* eslint-disable */
/* tslint:disable */
// @ts-ignore
import icon from 'vue-svgicon'
icon.register({
  'addImageFile': {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    data: '<path pid="0" d="m9 15.002-2-2-3 4h10l-3-6z"/><circle pid="1" cx="7" cy="10.002" r="2"/><path pid="2" d="M2 2.001h10v4h4v8.001h2V4.587L13.414.001H2c-1.103 0-2 .897-2 2v18c0 1.103.897 2 2 2h12v-2H2v-18zM21 19v-3h-2v3h-3v2h3v3h2v-3h3v-2z"/>'
  }
})
`

        // Write the input SVG file
        const svgFilePath = path.join(sourcePath, 'addImageFile.svg')
        fs.writeFileSync(svgFilePath, inputSvg, 'utf-8')

        // Execute the CLI command
        const command = `node "${cliPath}" -s "${sourcePath}" -t "${targetPath}" --es6`
        execSync(command, { cwd: tempDir })

        // Read the generated output
        const outputFilePath = path.join(targetPath, 'addImageFile.js')
        expect(fs.existsSync(outputFilePath)).toBe(true)

        const actualOutput = fs.readFileSync(outputFilePath, 'utf-8')

        // Assert the output matches expected
        expect(actualOutput).toBe(expectedOutput)
    })

    it('should generate index.js file when processing multiple SVG files', () => {
        // Create a second SVG file
        const simpleSvg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path d="M8 0l8 8-8 8-8-8z"/>
</svg>`

        const svgFilePath = path.join(sourcePath, 'simple.svg')
        fs.writeFileSync(svgFilePath, simpleSvg, 'utf-8')

        // Execute the CLI command
        const command = `node "${cliPath}" -s "${sourcePath}" -t "${targetPath}" --es6`
        execSync(command, { cwd: tempDir })

        // Check that index.js was created
        const indexFilePath = path.join(targetPath, 'index.js')
        expect(fs.existsSync(indexFilePath)).toBe(true)

        const indexContent = fs.readFileSync(indexFilePath, 'utf-8')

        // Verify index.js imports both icons
        expect(indexContent).toContain("import './addImageFile'")
        expect(indexContent).toContain("import './simple'")
    })
})
