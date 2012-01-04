var path = require('path');
var copy = require('dryice').copy;

function build() {
  console.log('Creating wysiwyg_forms/static/wysiwyg_forms/js/dwf.min.js');

  var project = copy.createCommonJsProject({
    roots: [path.join(__dirname, 'wysiwyg_forms/static/wysiwyg_forms/js')]
  });

  copy({
    source: [
      copy.getMiniRequire(),
      copy.source.commonjs({
        project: project,
        require: ['dwf']
      })
    ],
    filter: [
      copy.filter.moduleDefines,
      copy.filter.uglifyjs
    ],
    dest: 'wysiwyg_forms/static/wysiwyg_forms/js/dwf.min.js'
  });
}

build();
