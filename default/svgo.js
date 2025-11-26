module.exports = {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    // Don't minify IDs - prefixIds will handle uniqueness
                    cleanupIds: {
                        remove: true,
                        minify: false
                    },
                    // Inline styles before conversion
                    inlineStyles: {
                        onlyMatchedOnce: false
                    }
                }
            }
        },
        // Prefix all IDs with 'svgicon' so changeId can make them unique per-icon
        {
            name: 'prefixIds',
            params: {
                prefix: 'svgicon',
                delim: ''
            }
        },
        // Convert style attributes to presentation attributes
        'convertStyleToAttrs',
        // Remove any remaining style elements after conversion
        'removeStyleElement',
        // Convert shapes to paths for consistency
        'convertShapeToPath'
    ]
}
