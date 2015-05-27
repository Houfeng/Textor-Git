define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    
    var self = exports;
    var gui = require('self/utils/menu');
    var model = require('./git_model');

    self.onReady = function(_context) {
        self.context = _context;
        self.context.sidebar.items.push({
            'id': self.info.id||'git',
            'text': 'GIT',
            'uri': module.resovleUri('./git_view')
        });
    };

    self.onCreateModel = function(viewModel) {
        self.viewModel = viewModel;
        self.viewModel.git = model;
    };

    self.onChooseDir = function() {
        self.viewModel.git.loadRepos();
    };

});