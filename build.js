({
    baseUrl: 'wysiwyg_forms/static/wysiwyg_forms/js',
    paths: {
        requireLib: 'require'
    },
    name: 'dwf',
    optimize: 'uglify2',
    out: 'wysiwyg_forms/static/wysiwyg_forms/js/dwf.min.js',
    include: ['requireLib'],
    exclude: ['jquery']
})