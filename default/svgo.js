module.exports = {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    // Ensure IDs are cleaned up with our prefix
                    cleanupIds: {
                        remove: true,
                        prefix: 'svgicon'
                    },
                    // Inline styles before conversion
                    inlineStyles: {
                        onlyMatchedOnce: false
                    }
                }
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
