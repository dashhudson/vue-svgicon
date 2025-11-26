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
    data: '<path pid="0" d="m9 15.002-2-2-3 4h10l-3-6z" _fill="#000"/><circle pid="1" cx="7" cy="10.002" r="2" _fill="#000"/><path pid="2" d="M2 2.001h10v4h4v8.001h2V4.587L13.414.001H2c-1.103 0-2 .897-2 2v18c0 1.103.897 2 2 2h12v-2H2v-18zM21 19v-3h-2v3h-3v2h3v3h2v-3h3v-2z" _fill="#000"/>'
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

    it('should handle SVG with clip-path references', () => {
        const inputSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_689_18175)">
<path d="M4.04061 23.0008V18.9466H3.02707C1.90813 18.9466 1 18.0375 1 16.9195V7.7977C1 6.67876 1.90813 5.77063 3.02707 5.77063H12.1489V7.7977H3.02707V16.9195H6.06769V18.9466L8.76978 16.9195H16.2031V10.8383H18.2301V16.9195C18.2301 18.0375 17.322 18.9466 16.2031 18.9466H9.44682L4.04061 23.0008Z" fill="#686a7a"/>
<path d="M17.2158 8.21663L13.459 4.45979L14.892 3.02677L17.2158 5.35061L21.5666 0.999878L22.9996 2.43289L17.2158 8.21663Z" fill="#686a7a"/>
</g>
<defs>
<clipPath id="clip0_689_18175">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>`

        const expectedOutput = `/* eslint-disable */
/* tslint:disable */
// @ts-ignore
import icon from 'vue-svgicon'
icon.register({
  'chatBubbleSquareCheck': {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    data: '<g clip-path="url(#svgicon_chatBubbleSquareCheck_a)" _fill="#686a7a"><path pid="0" d="M4.04 23v-4.053H3.028A2.028 2.028 0 0 1 1 16.92V7.797c0-1.12.908-2.027 2.027-2.027h9.122v2.027H3.027v9.122h3.04v2.027L8.77 16.92h7.433v-6.082h2.027v6.082a2.028 2.028 0 0 1-2.027 2.027H9.447L4.04 23ZM17.216 8.217 13.459 4.46l1.433-1.433 2.324 2.324L21.566 1 23 2.433l-5.784 5.784Z"/></g><defs><clipPath id="svgicon_chatBubbleSquareCheck_a"><path pid="1" _fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs>'
  }
})
`

        // Write the input SVG file
        const svgFilePath = path.join(sourcePath, 'chatBubbleSquareCheck.svg')
        fs.writeFileSync(svgFilePath, inputSvg, 'utf-8')

        // Execute the CLI command
        const command = `node "${cliPath}" -s "${sourcePath}" -t "${targetPath}" --es6`
        execSync(command, { cwd: tempDir })

        // Read the generated output
        const outputFilePath = path.join(targetPath, 'chatBubbleSquareCheck.js')
        expect(fs.existsSync(outputFilePath)).toBe(true)

        const actualOutput = fs.readFileSync(outputFilePath, 'utf-8')

        // Assert the output matches expected
        expect(actualOutput).toBe(expectedOutput)
    })
})
