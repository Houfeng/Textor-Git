/*csd*/define(function(require,exports,module){var c=exports;var a=require("self/utils/menu");var b=require("./git_model");c.onReady=function(d){c.context=d;c.context.sidebar.items.push({"id":c.info.id||"git","text":"GIT","uri":module.resovleUri("./git_view")});};c.onCreateModel=function(d){c.viewModel=d;c.viewModel.git=b;};c.onChooseDir=function(){c.viewModel.git.loadRepos();};});